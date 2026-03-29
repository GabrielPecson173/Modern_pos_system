import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Stack,
  ThemeIcon,
  Divider,
  Badge,
  Skeleton,
  ScrollArea,
} from '@mantine/core';
import {
  IconDroplet,
  IconWashMachine,
  IconCash,
  IconReceipt,
  IconCalendarStats,
  IconTrendingUp,
} from '@tabler/icons-react';
import { RootState, AppDispatch } from '../store';
import { fetchOrders } from '../store/ordersSlice';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

function todayStr() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function thisMonthPrefix() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}) {
  return (
    <Paper withBorder radius="md" p="md" style={{ borderColor: '#e2e8f0' }}>
      <Group justify="space-between" mb={8}>
        <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Text>
        <ThemeIcon size={32} radius="md" color={color} variant="light">
          {icon}
        </ThemeIcon>
      </Group>
      {loading ? (
        <Skeleton height={28} width="60%" mb={4} />
      ) : (
        <Text fw={800} size="xl" style={{ fontVariantNumeric: 'tabular-nums', color: '#0f172a' }}>
          {value}
        </Text>
      )}
      {sub && (
        <Text size="xs" c="dimmed" mt={2}>{sub}</Text>
      )}
    </Paper>
  );
}

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <Group gap={8} mb={10}>
      <ThemeIcon size={22} radius="sm" color={color} variant="light">
        {icon}
      </ThemeIcon>
      <Text fw={700} size="sm" style={{ color: '#0f172a' }}>{label}</Text>
    </Group>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: waterOrders, loading: waterLoading } = useSelector(
    (s: RootState) => s.orders
  );
  const { items: laundryOrders, loading: laundryLoading } = useSelector(
    (s: RootState) => s.laundry
  );

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const today = todayStr();
  const monthPrefix = thisMonthPrefix();

  // current month label e.g. "March 2026"
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ── Water stats ──
  const waterMonthly = waterOrders
    .filter((o) => o.order_date?.slice(0, 7) === monthPrefix)
    .reduce((s, o) => s + (o.total ? Number(o.total) : 0), 0);
  const waterToday = waterOrders
    .filter((o) => o.order_date?.slice(0, 10) === today)
    .reduce((s, o) => s + (o.total ? Number(o.total) : 0), 0);
  const waterCount = waterOrders.length;
  const waterTodayCount = waterOrders.filter(
    (o) => o.order_date?.slice(0, 10) === today
  ).length;

  // ── Laundry stats ──
  const laundryMonthly = laundryOrders
    .filter((o) => o.created_at?.slice(0, 7) === monthPrefix)
    .reduce((s, o) => s + o.total_php, 0);
  const laundryToday = laundryOrders
    .filter((o) => o.created_at?.slice(0, 10) === today)
    .reduce((s, o) => s + o.total_php, 0);
  const laundryCount = laundryOrders.length;
  const laundryPaid = laundryOrders.filter((o) => o.payment_status === 'Paid').length;
  const laundryUnpaid = laundryOrders.filter((o) => o.payment_status === 'Unpaid').length;

  // ── Combined ──
  const combinedMonthly = waterMonthly + laundryMonthly;
  const combinedToday = waterToday + laundryToday;

  // ── Recent orders — last 8 across both, sorted newest first ──
  const recentWater = waterOrders
    .filter((o) => o.created_at)
    .map((o) => ({
      id: o.id,
      label: o.customer_name || 'Unknown',
      sub: o.product || o.order_type || '—',
      amount: o.total ? Number(o.total) : 0,
      time: o.created_at!,
      source: 'water' as const,
    }));

  const recentLaundry = laundryOrders.map((o) => ({
    id: o.id,
    label: o.customer_name,
    sub: `${o.pickup_day} pickup`,
    amount: o.total_php,
    time: o.created_at,
    source: 'laundry' as const,
  }));

  const recentAll = [...recentWater, ...recentLaundry]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  const loading = waterLoading || laundryLoading;

  return (
    <ScrollArea style={{ height: '100vh' }}>
      <Box p={20} style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>

        {/* Page header — no Live badge */}
        <Box mb={20}>
          <Text fw={800} size="lg" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            Dashboard
          </Text>
          <Text size="xs" c="dimmed">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </Box>

        {/* ── Combined summary row ── */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb={24}>
          <StatCard
            label="This Month's Revenue"
            value={fmt(combinedMonthly)}
            sub={`Water + Laundry · ${monthLabel}`}
            icon={<IconTrendingUp size={16} />}
            color="teal"
            loading={loading}
          />
          <StatCard
            label="Today's Earnings"
            value={fmt(combinedToday)}
            sub="Combined across both services"
            icon={<IconCalendarStats size={16} />}
            color="blue"
            loading={loading}
          />
          <StatCard
            label="Total Orders"
            value={String(waterCount + laundryCount)}
            sub={`${waterCount} water · ${laundryCount} laundry`}
            icon={<IconReceipt size={16} />}
            color="violet"
            loading={loading}
          />
        </SimpleGrid>

        {/* ── Per-service breakdown ── */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb={24}>

          {/* Water orders */}
          <Paper withBorder radius="md" p="md" style={{ borderColor: '#e2e8f0' }}>
            <SectionHeader
              icon={<IconDroplet size={13} />}
              label="Water Orders"
              color="teal"
            />
            <SimpleGrid cols={2} spacing="xs">
              <Box>
                <Text size="xs" c="dimmed" mb={2}>This month</Text>
                {loading ? <Skeleton height={22} /> : (
                  <Text fw={700} size="md" c="teal" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(waterMonthly)}
                  </Text>
                )}
              </Box>
              <Box>
                <Text size="xs" c="dimmed" mb={2}>Today</Text>
                {loading ? <Skeleton height={22} /> : (
                  <Text fw={700} size="md" c="blue" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(waterToday)}
                  </Text>
                )}
              </Box>
            </SimpleGrid>
            <Divider my={10} color="#f1f5f9" />
            <Group gap={8}>
              <Badge size="xs" color="teal" variant="light" radius="sm">
                {waterCount} total orders
              </Badge>
              <Badge size="xs" color="blue" variant="light" radius="sm">
                {waterTodayCount} today
              </Badge>
            </Group>
          </Paper>

          {/* Laundry orders */}
          <Paper withBorder radius="md" p="md" style={{ borderColor: '#e2e8f0' }}>
            <SectionHeader
              icon={<IconWashMachine size={13} />}
              label="Laundry Orders"
              color="blue"
            />
            <SimpleGrid cols={2} spacing="xs">
              <Box>
                <Text size="xs" c="dimmed" mb={2}>This month</Text>
                {loading ? <Skeleton height={22} /> : (
                  <Text fw={700} size="md" c="blue" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(laundryMonthly)}
                  </Text>
                )}
              </Box>
              <Box>
                <Text size="xs" c="dimmed" mb={2}>Today</Text>
                {loading ? <Skeleton height={22} /> : (
                  <Text fw={700} size="md" c="teal" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(laundryToday)}
                  </Text>
                )}
              </Box>
            </SimpleGrid>
            <Divider my={10} color="#f1f5f9" />
            <Group gap={8}>
              <Badge size="xs" color="green" variant="light" radius="sm">
                {laundryPaid} paid
              </Badge>
              <Badge size="xs" color="yellow" variant="light" radius="sm">
                {laundryUnpaid} pending
              </Badge>
              <Badge size="xs" color="blue" variant="light" radius="sm">
                {laundryCount} total
              </Badge>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* ── Recent orders ── */}
        <Paper withBorder radius="md" p="md" style={{ borderColor: '#e2e8f0' }}>
          <SectionHeader
            icon={<IconCash size={13} />}
            label="Recent Orders"
            color="teal"
          />
          {loading ? (
            <Stack gap={8}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={44} radius="sm" />
              ))}
            </Stack>
          ) : recentAll.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="lg">No orders yet.</Text>
          ) : (
            <Stack gap={0}>
              {recentAll.map((item, i) => (
                <Box key={item.id}>
                  {i > 0 && <Divider color="#f1f5f9" />}
                  <Flex align="center" justify="space-between" py={10} px={4}>
                    <Group gap={10}>
                      <ThemeIcon
                        size={30}
                        radius="md"
                        color={item.source === 'water' ? 'teal' : 'blue'}
                        variant="light"
                      >
                        {item.source === 'water'
                          ? <IconDroplet size={14} />
                          : <IconWashMachine size={14} />}
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={600} style={{ color: '#0f172a' }}>
                          {item.label}
                        </Text>
                        <Text size="xs" c="dimmed">{item.sub}</Text>
                      </Box>
                    </Group>
                    <Box ta="right">
                      <Text size="sm" fw={700} ff="monospace" c={item.source === 'water' ? 'teal' : 'blue'}>
                        {fmt(item.amount)}
                      </Text>
                      <Text size="xs" c="dimmed">{timeAgo(item.time)}</Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

      </Box>
    </ScrollArea>
  );
}
