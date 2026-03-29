from django.core.management.base import BaseCommand
from pos.models import User


class Command(BaseCommand):
    help = 'Seed the POS database with initial users for all three roles'

    def handle(self, *args, **kwargs):
        self.seed_admins()
        self.seed_water_employees()
        self.seed_laundry_employees()
        self.stdout.write(self.style.SUCCESS('POS users seeded successfully!'))

    # ✅ SUPER ADMINS (see everything: Dashboard, Water, Laundry, Audit Log)
    def seed_admins(self):
        admins = [
            {
                'name':     'Admin Owner',
                'email':    'admin@aquacrystal.com',
                'password': 'password123',
                'role':     'admin',
            },
        ]
        self._upsert(admins, 'admin')

    # ✅ WATER EMPLOYEES (Water page only — orders + today's revenue + order logs)
    def seed_water_employees(self):
        water_employees = [
            {
                'name':     'Juan dela Cruz',
                'email':    'water1@aquacrystal.com',
                'password': 'password123',
                'role':     'water_employee',
            },
            {
                'name':     'Maria Santos',
                'email':    'water2@aquacrystal.com',
                'password': 'password123',
                'role':     'water_employee',
            },
        ]
        self._upsert(water_employees, 'water employee')

    # ✅ LAUNDRY EMPLOYEES (Laundry page only — orders + today's revenue + order logs)
    def seed_laundry_employees(self):
        laundry_employees = [
            {
                'name':     'Pedro Reyes',
                'email':    'laundry1@aquacrystal.com',
                'password': 'password123',
                'role':     'laundry_employee',
            },
            {
                'name':     'Ana Villanueva',
                'email':    'laundry2@aquacrystal.com',
                'password': 'password123',
                'role':     'laundry_employee',
            },
        ]
        self._upsert(laundry_employees, 'laundry employee')

    def _upsert(self, users_data, label):
        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={'name': data['name'], 'role': data['role']},
            )

            user.name = data['name']
            user.role = data['role']
            user.set_password(data['password'])  # ✅ always store as a hash
            user.save()

            verb = 'Created' if created else 'Updated'
            self.stdout.write(f"  {verb} {label}: {user.name}")
