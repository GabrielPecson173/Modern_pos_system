import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Text, TextInput, Group, Stack, Select, SegmentedControl,
  ActionIcon, Flex, Badge, Button, Alert, Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSearch, IconX, IconFilter, IconWashMachine,
  IconChevronRight, IconPlus, IconCash,
} from '@tabler/icons-react';
import { RootState, AppDispatch } from '../store';
import {
  fetchLaundryOrders, createLaundryOrder, patchLaundryOrder,
  deleteLaundryOrder, clearLaundryError, CreateLaundryOrderPayload,
} from '../store/laundrySlice';
import { LaundryOrderCard } from '../components/laundry/LaundryOrderCard';
import { AddLaundryModal } from '../components/laundry/AddLaundryModal';
import { PickupDay, PaymentStatus, PaymentMethod } from '../components/laundry/laundry.types';

const PICKUP_DAYS: PickupDay[] = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function todayStr() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

const formatPHP = (value: number) =>
  `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export function LaundryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((s: RootState) => s.laundry);
  const [search,       setSearch]       = useState('');
  const [dayFilter,    setDayFilter]    = useState<PickupDay | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [modalOpened,  { open, close }] = useDisclosure(false);

  const today = todayStr();

  useEffect(() => { dispatch(fetchLaundryOrders()); }, [dispatch]);

  // Only today's orders
  const todayItems = items.filter((o) => o.created_at?.slice(0, 10) === today);

  const todayRevenue = todayItems.reduce((s, o) => s + Number(o.total_php), 0);
  const paidCount    = todayItems.filter((o) => o.payment_status === 'Paid').length;
  const unpaidCount  = todayItems.filter((o) => o.payment_status === 'Unpaid').length;

  const filtered = useMemo(() => {
    return todayItems.filter((o) => {
      const matchName   = o.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchDay    = dayFilter    === 'All' || o.pickup_day     === dayFilter;
      const matchStatus = statusFilter === 'All' || o.payment_status === statusFilter;
      return matchName && matchDay && matchStatus;
    });
  }, [todayItems, search, dayFilter, statusFilter]);

  const hasFilters = search || dayFilter !== 'All' || statusFilter !== 'All';

  const handleAddOrder         = (p: CreateLaundryOrderPayload) => { dispatch(createLaundryOrder(p)); };
  const handleMarkPaid         = (id: string, paid: boolean)    => { dispatch(patchLaundryOrder({ id, payment_status: paid ? 'Paid' : 'Unpaid' })); };
  const handlePaymentMethodChange = (id: string, method: PaymentMethod) => { dispatch(patchLaundryOrder({ id, payment_method: method })); };
  const handleDelete           = (id: string)                   => { dispatch(deleteLaundryOrder(id)); };

  return (
    <>
      <AddLaundryModal opened={modalOpened} onClose={close} onSave={handleAddOrder} />

      <Box style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

        {/* ── Top bar ── */}
        <Box px={16} py={12} style={{ backgroundColor: 'white', borderBottom: '0.5px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
          <Flex align="center" justify="space-between" mb={12}>
            <Flex align="center" gap={6}>
              <Text size="sm" fw={600} c="blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                Dashboard
              </Text>
              <IconChevronRight size={14} color="#94a3b8" />
              <Text size="sm" fw={500} c="dimmed">Laundry</Text>
            </Flex>
            <Group gap={8}>
              <Badge size="sm" variant="light" color="green"  radius="sm">{paidCount} paid</Badge>
              <Badge size="sm" variant="light" color="yellow" radius="sm">{unpaidCount} pending</Badge>
              <Button size="xs" color="blue" leftSection={<IconPlus size={13} />} onClick={open} radius="md" loading={loading}>
                New Order
              </Button>
            </Group>
          </Flex>

          <TextInput
            placeholder="Search customer name..."
            leftSection={<IconSearch size={14} />}
            rightSection={search ? <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setSearch('')}><IconX size={12} /></ActionIcon> : null}
            value={search} onChange={(e) => setSearch(e.currentTarget.value)}
            radius="xl" size="sm" mb={10}
            styles={{ input: { backgroundColor: '#f1f5f9', border: '0.5px solid #e2e8f0', fontSize: 13 } }}
          />

          <Flex gap={8} align="center" wrap="nowrap">
            <IconFilter size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
            <Select
              size="xs" placeholder="All days"
              data={[{ value: 'All', label: 'All days' }, ...PICKUP_DAYS.map((d) => ({ value: d, label: d }))]}
              value={dayFilter} onChange={(v) => setDayFilter((v ?? 'All') as PickupDay | 'All')}
              radius="xl" style={{ flex: 1, minWidth: 110 }}
              styles={{ input: { fontSize: 12, backgroundColor: '#f1f5f9', border: '0.5px solid #e2e8f0' } }}
            />
            <SegmentedControl
              value={statusFilter} onChange={(v) => setStatusFilter(v as PaymentStatus | 'All')}
              data={[{ label: 'All', value: 'All' }, { label: '✓ Paid', value: 'Paid' }, { label: '⏳ Pending', value: 'Unpaid' }]}
              size="xs" radius="xl"
              styles={{ root: { backgroundColor: '#f1f5f9', border: '0.5px solid #e2e8f0' }, indicator: { borderRadius: 99 }, label: { fontSize: 11, fontWeight: 600 } }}
            />
          </Flex>
        </Box>

        {/* ── Today's Revenue Strip ── */}
        <Box mx={16} mt={12} style={{ backgroundColor: '#eff6ff', border: '0.5px solid #bfdbfe', borderRadius: 10, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Flex align="center" gap={8}>
            <IconCash size={16} color="#2563eb" />
            <Text size="12px" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today's Revenue</Text>
          </Flex>
          <Text fw={800} size="lg" style={{ color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>
            {formatPHP(todayRevenue)}
          </Text>
        </Box>

        {error && <Alert color="red" m={12} withCloseButton onClose={() => dispatch(clearLaundryError())}>{error}</Alert>}

        {/* ── Cards ── */}
        <Box px={16} py={12}>
          {loading && items.length === 0 ? (
            <Center py={60}><Text size="sm" c="dimmed">Loading orders...</Text></Center>
          ) : filtered.length === 0 ? (
            <Flex direction="column" align="center" justify="center" style={{ minHeight: 200 }} gap={8}>
              <IconWashMachine size={40} color="#cbd5e1" />
              <Text size="sm" c="dimmed">
                {hasFilters ? 'No orders match your filters.' : 'No orders today yet.'}
              </Text>
              {hasFilters && (
                <Text size="xs" c="blue" style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setSearch(''); setDayFilter('All'); setStatusFilter('All'); }}>
                  Clear filters
                </Text>
              )}
            </Flex>
          ) : (
            <Stack gap={10}>
              {filtered.map((order) => (
                <LaundryOrderCard key={order.id} order={order}
                  onMarkPaid={handleMarkPaid}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
}
