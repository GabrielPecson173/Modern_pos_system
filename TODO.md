# Aqua Crystal POS TODO

## Backend Integration Progress
- [x] Create backend/pos/models.py, serializers.py, views.py, admin.py, urls.py from New folder
- [x] Update backend/pos/settings.py (DRF, CORS, INSTALLED_APPS)
- [ ] Install deps: `cd backend && uv pip install djangorestframework django-cors-headers python-dotenv`
- [ ] Migrations: `cd backend && python manage.py makemigrations pos && python manage.py migrate`
- [ ] Test: `cd backend && python manage.py runserver` → /api/water-orders/
- [ ] Delete "New folder"
- [ ] Frontend: Update ordersApi.ts to /api/water-orders/ + remove mocks?

## Previous Frontend
- [x] Fixed TailwindCSS v4 PostCSS error
- [x] Merged AddOrderModal + enhanced AppLayout
- [x] Fixed deps (@mantine/form)
- [x] Removed aqua-crystal/ dir
- [x] Made table read-only (no inline edits)
- [x] Removed updateRowLocally (unused)
- [ ] Integrate modal → table (add reducer addFilledOrder?)

**Test:** `cd frontend && npm run dev` (:5173)
