"""
pos/views_auth.py  (replace your existing one)

Adds audit logging to login and logout.
"""

from django.contrib.auth import authenticate
from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework          import status
from rest_framework_simplejwt.tokens import RefreshToken

from pos.models           import User
from pos.authentication   import CustomJWTAuthentication
from pos.audit_logger     import log_action


class LoginView(APIView):
    authentication_classes = []   # no auth needed to log in

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            log_action(
                user_email='unknown',
                user_name='Unknown',
                action='login',
                entity_type='session',
                description=f'Failed login attempt for "{email}" — user not found.',
                status='failed',
            )
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            log_action(
                user_email=user.email,
                user_name=getattr(user, 'name', user.email),
                user_role=getattr(user, 'role', ''),
                action='login',
                entity_type='session',
                entity_id=str(user.id),
                description=f'Failed login for {user.email} — wrong password.',
                status='failed',
            )
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        refresh['user_id'] = str(user.id)   # UUID must be str for JWT serialization
        refresh['role']    = user.role

        log_action(
            user_email=user.email,
            user_name=getattr(user, 'name', user.email),
            user_role=getattr(user, 'role', ''),
            action='login',
            entity_type='session',
            entity_id=str(user.id),
            description=f'{getattr(user, "name", user.email)} logged in as {user.role}.',
            status='success',
        )

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':    str(user.id),      # UUID must be str for JSON serialization
                'email': user.email,
                'name':  getattr(user, 'name', ''),
                'role':  user.role,
            },
        })


class LogoutView(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request):
        user = request.user
        log_action(
            request=request,
            action='logout',
            entity_type='session',
            entity_id=str(getattr(user, 'id', '')),
            description=f'{getattr(user, "name", user.email)} logged out.',
        )
        # Optionally blacklist the refresh token here if using simplejwt blacklist
        return Response({'detail': 'Logged out.'})
