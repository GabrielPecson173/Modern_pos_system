import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Avatar,
  Tooltip,
  UnstyledButton,
  Stack,
  Text,
  ActionIcon,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconDroplet, IconWashMachine } from '@tabler/icons-react';
import { AddOrderModal } from './AddOrderModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <Tooltip label={label} position="right" withArrow>
      <UnstyledButton
        onClick={onClick}
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: active ? 'var(--mantine-color-gray-1)' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: active
              ? label === 'Water'
                ? 'var(--mantine-color-teal-6)'
                : 'var(--mantine-color-blue-6)'
              : 'var(--mantine-color-gray-2)',
            color: active ? 'white' : 'var(--mantine-color-gray-6)',
          }}
        >
          {icon}
        </Box>
        <Text size="9px" c="dimmed">{label}</Text>
      </UnstyledButton>
    </Tooltip>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const dispatch = useDispatch<AppDispatch>();
  const orderCount = useSelector((state: RootState) =>
    state.orders.items.filter((o) => o.name !== '').length
  );

  const navItems = [
    { icon: <IconDroplet size={14} />, label: 'Water', path: '/water' },
    { icon: <IconWashMachine size={14} />, label: 'Laundry', path: '/laundry' },
  ];

  return (
    <>
<AddOrderModal opened={modalOpened} onClose={closeModal} />

      <AppShell
        navbar={{ width: 64, breakpoint: 'sm' }}
        padding={0}
      >
        <AppShell.Navbar
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px 0',
            gap: 4,
            borderRight: '0.5px solid var(--mantine-color-gray-3)',
          }}
        >
          <Stack
            align="center"
            gap={6}
            pb={12}
            style={{ borderBottom: '0.5px solid var(--mantine-color-gray-3)', width: '100%' }}
          >
            <Avatar size={36} radius="xl" color="teal">AC</Avatar>
            <Tooltip label="New Order" position="right" withArrow>
              <ActionIcon
                size={28}
                radius="xl"
                color="teal"
                variant="filled"
                onClick={openModal}
                aria-label="Add new order"
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Tooltip>
            <Text size="9px" c="dimmed">Add</Text>
          </Stack>

          <Stack align="center" gap={4} mt={8}>
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                {...item}
                active={
                  location.pathname === item.path ||
                  (item.path === '/water' && location.pathname === '/')
                }
                onClick={() => navigate(item.path)}
              />
            ))}
          </Stack>

          {orderCount > 0 && (
            <Tooltip
              label={`${orderCount} order(s) saved this session`}
              position="right"
              withArrow
            >
              <Box
                mt="auto"
                mb={12}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'var(--mantine-color-teal-1)',
                  border: '0.5px solid var(--mantine-color-teal-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                }}
              >
                <Text size="10px" fw={600} c="teal">{orderCount}</Text>
              </Box>
            </Tooltip>
          )}
        </AppShell.Navbar>

        <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </>
  );
}

