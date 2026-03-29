import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell, Avatar, Tooltip, UnstyledButton, Stack,
  Text, Box, Group, Button, Modal, Divider, Collapse,
} from '@mantine/core';
import {
  IconLayoutDashboard, IconDroplet, IconWashMachine,
  IconLogout, IconChevronRight, IconChevronDown, IconClipboardList,
  IconShieldCheck,
} from '@tabler/icons-react';

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
  icon: Icon, label, path, color, active, onClick, indent = false,
}: {
  icon: React.FC<{ size?: number; stroke?: number }>;
  label: string; path: string; color: string;
  active: boolean; onClick: () => void; indent?: boolean;
}) {
  return (
    <UnstyledButton onClick={onClick} style={{
      width: '100%', padding: indent ? '7px 12px 7px 24px' : '8px 12px',
      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
      backgroundColor: active ? `var(--mantine-color-${color}-0)` : 'transparent',
      color: active ? `var(--mantine-color-${color}-7)` : 'var(--mantine-color-gray-7)',
      fontWeight: active ? 600 : 400, fontSize: 13,
      transition: 'background 0.15s, color 0.15s',
    }}>
      <Box style={{
        width: indent ? 24 : 28, height: indent ? 24 : 28, borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        backgroundColor: active ? `var(--mantine-color-${color}-6)` : 'var(--mantine-color-gray-1)',
        color: active ? 'white' : 'var(--mantine-color-gray-5)',
      }}>
        <Icon size={indent ? 12 : 14} stroke={2} />
      </Box>
      <Text size={indent ? 'xs' : 'sm'} fw={active ? 600 : 400} style={{ flex: 1 }}>{label}</Text>
      {active && <IconChevronRight size={12} style={{ color: `var(--mantine-color-${color}-5)` }} />}
    </UnstyledButton>
  );
}

// ─── Collapse trigger ─────────────────────────────────────────────────────────

function CollapseButton({
  icon: Icon, label, opened, onClick,
}: {
  icon: React.FC<{ size?: number; stroke?: number }>;
  label: string; opened: boolean; onClick: () => void;
}) {
  return (
    <UnstyledButton onClick={onClick} style={{
      width: '100%', padding: '8px 12px', borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: 10,
      backgroundColor: opened ? 'var(--mantine-color-gray-1)' : 'transparent',
      color: 'var(--mantine-color-gray-7)', fontSize: 13,
      transition: 'background 0.15s',
    }}>
      <Box style={{
        width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        backgroundColor: opened ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-gray-1)',
        color: opened ? 'var(--mantine-color-gray-7)' : 'var(--mantine-color-gray-5)',
      }}>
        <Icon size={14} stroke={2} />
      </Box>
      <Text size="sm" fw={500} style={{ flex: 1 }}>{label}</Text>
      {opened
        ? <IconChevronDown size={12} color="var(--mantine-color-gray-5)" />
        : <IconChevronRight size={12} color="var(--mantine-color-gray-5)" />}
    </UnstyledButton>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [logoutOpen,  setLogoutOpen]  = useState(false);
  const [waterOpen,   setWaterOpen]   = useState(true);
  const [laundryOpen, setLaundryOpen] = useState(true);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const role      = user?.role || '';
  const userName  = user?.name || 'Aqua Crystal';
  const roleLabel =
    role === 'admin'              ? 'Admin'
    : role === 'water_employee'   ? 'Water Employee'
    : role === 'laundry_employee' ? 'Laundry Employee'
    : '';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setLogoutOpen(false);
    navigate('/login');
  };

  const isAdmin           = role === 'admin';
  const isWaterEmployee   = role === 'water_employee';
  const isLaundryEmployee = role === 'laundry_employee';

  const at = (path: string) => location.pathname === path;

  return (
    <>
      <Modal opened={logoutOpen} onClose={() => setLogoutOpen(false)}
        title={<Text fw={700}>Confirm Logout</Text>} centered size="sm">
        <Text size="sm" c="dimmed">Are you sure you want to log out of Aqua Crystal?</Text>
        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button color="red" onClick={handleLogout}>Log Out</Button>
        </Group>
      </Modal>

      <AppShell header={{ height: 52 }} navbar={{ width: 220, breakpoint: 'sm' }} padding={0}>

        {/* ── Header ── */}
        <AppShell.Header style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '0.5px solid var(--mantine-color-gray-3)', backgroundColor: 'white' }}>
          <Group justify="space-between" style={{ width: '100%' }}>
            <Group gap={10}>
              <Avatar size={30} radius="xl" color="teal" style={{ fontSize: 11 }}>AC</Avatar>
              <Box>
                <Text size="sm" fw={700} lh={1.2}>Aqua Crystal</Text>
                <Text size="10px" c="dimmed" lh={1.2}>Point of Sale</Text>
              </Box>
            </Group>
            <Tooltip label="Logout" withArrow position="bottom">
              <UnstyledButton onClick={() => setLogoutOpen(true)} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mantine-color-gray-6)', backgroundColor: 'var(--mantine-color-gray-0)', border: '0.5px solid var(--mantine-color-gray-3)' }}>
                <IconLogout size={15} />
              </UnstyledButton>
            </Tooltip>
          </Group>
        </AppShell.Header>

        {/* ── Navbar ── */}
        <AppShell.Navbar style={{ display: 'flex', flexDirection: 'column', padding: '12px 10px', borderRight: '0.5px solid var(--mantine-color-gray-3)', backgroundColor: 'white', overflowY: 'auto' }}>
          <Stack gap={4} style={{ flex: 1 }}>

            {/* ── ADMIN ── */}
            {isAdmin && (
              <>
                {/* Overview */}
                <Text size="10px" fw={600} tt="uppercase" c="dimmed" px={12} mb={4} style={{ letterSpacing: '0.06em' }}>Overview</Text>
                <NavLink icon={IconLayoutDashboard} label="Dashboard"  path="/dashboard"  color="teal"   active={at('/dashboard')}  onClick={() => navigate('/dashboard')}  />
                <NavLink icon={IconShieldCheck}     label="Audit Logs" path="/audit-logs" color="violet" active={at('/audit-logs')} onClick={() => navigate('/audit-logs')} />

                <Divider color="gray.2" my={10} />

                {/* Services */}
                <Text size="10px" fw={600} tt="uppercase" c="dimmed" px={12} mb={4} style={{ letterSpacing: '0.06em' }}>Services</Text>

                {/* Water collapsible */}
                <CollapseButton icon={IconDroplet} label="Water" opened={waterOpen} onClick={() => setWaterOpen((o) => !o)} />
                <Collapse in={waterOpen}>
                  <Stack gap={1} mt={1}>
                    <NavLink icon={IconDroplet}       label="Water Page"  path="/water"      color="teal" active={at('/water')}      onClick={() => navigate('/water')}      indent />
                    <NavLink icon={IconClipboardList} label="Order Logs"  path="/water/logs" color="teal" active={at('/water/logs')} onClick={() => navigate('/water/logs')} indent />
                  </Stack>
                </Collapse>

                {/* Laundry collapsible */}
                <CollapseButton icon={IconWashMachine} label="Laundry" opened={laundryOpen} onClick={() => setLaundryOpen((o) => !o)} />
                <Collapse in={laundryOpen}>
                  <Stack gap={1} mt={1}>
                    <NavLink icon={IconWashMachine}   label="Laundry Page" path="/laundry"      color="blue" active={at('/laundry')}      onClick={() => navigate('/laundry')}      indent />
                    <NavLink icon={IconClipboardList} label="Order Logs"   path="/laundry/logs" color="blue" active={at('/laundry/logs')} onClick={() => navigate('/laundry/logs')} indent />
                  </Stack>
                </Collapse>
              </>
            )}

            {/* ── WATER EMPLOYEE ── */}
            {isWaterEmployee && (
              <>
                <Text size="10px" fw={600} tt="uppercase" c="dimmed" px={12} mb={4} style={{ letterSpacing: '0.06em' }}>Services</Text>
                <CollapseButton icon={IconDroplet} label="Water" opened={waterOpen} onClick={() => setWaterOpen((o) => !o)} />
                <Collapse in={waterOpen}>
                  <Stack gap={1} mt={1}>
                    <NavLink icon={IconDroplet}       label="Water Page"  path="/water"      color="teal" active={at('/water')}      onClick={() => navigate('/water')}      indent />
                    <NavLink icon={IconClipboardList} label="Order Logs"  path="/water/logs" color="teal" active={at('/water/logs')} onClick={() => navigate('/water/logs')} indent />
                  </Stack>
                </Collapse>
              </>
            )}

            {/* ── LAUNDRY EMPLOYEE ── */}
            {isLaundryEmployee && (
              <>
                <Text size="10px" fw={600} tt="uppercase" c="dimmed" px={12} mb={4} style={{ letterSpacing: '0.06em' }}>Services</Text>
                <CollapseButton icon={IconWashMachine} label="Laundry" opened={laundryOpen} onClick={() => setLaundryOpen((o) => !o)} />
                <Collapse in={laundryOpen}>
                  <Stack gap={1} mt={1}>
                    <NavLink icon={IconWashMachine}   label="Laundry Page" path="/laundry"      color="blue" active={at('/laundry')}      onClick={() => navigate('/laundry')}      indent />
                    <NavLink icon={IconClipboardList} label="Order Logs"   path="/laundry/logs" color="blue" active={at('/laundry/logs')} onClick={() => navigate('/laundry/logs')} indent />
                  </Stack>
                </Collapse>
              </>
            )}

          </Stack>

          {/* Bottom user info */}
          <Box style={{ borderTop: '0.5px solid var(--mantine-color-gray-3)', paddingTop: 10, marginTop: 'auto' }}>
            <Group gap={8} px={4}>
              <Avatar size={28} radius="xl" color="teal" style={{ fontSize: 10 }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" fw={600} truncate>{userName}</Text>
                <Text size="10px" c="dimmed" truncate>{roleLabel}</Text>
              </Box>
            </Group>
          </Box>
        </AppShell.Navbar>

        <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </>
  );
}
