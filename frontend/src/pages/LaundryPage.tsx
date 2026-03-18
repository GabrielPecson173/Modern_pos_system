import { useState, useMemo } from 'react';
import {
  Box,
  Text,
  TextInput,
  Group,
  Stack,
  Select,
  SegmentedControl,
  ActionIcon,
  Flex,
  Badge,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconX, IconFilter, IconWashMachine } from '@tabler/icons-react';
import { LaundryOrderCard } from '../components/laundry/LaundryOrderCard';
import { AddLaundryModal } from '../components/laundry/AddLaundryModal';
import { MOCK_LAUNDRY_ORDERS } from '../components/laundry/laundry.mock';
import { LaundryOrder, PickupDay, PaymentStatus } from '../components/laundry/laundry.types';

const PICKUP_DAYS: PickupDay[] = [
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
];

export function LaundryPage() {
  const [orders, setOrders] = useState<LaundryOrder[]>(MOCK_LAUNDRY_ORDERS);
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState<PickupDay | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [modalOpened, { open, close }] = useDisclosure(false);

  const totalRevenue = orders.reduce((s, o) => s + o.total_php, 0);
  const paidCount    = orders.filter((o) => o.payment_status === 'Paid').length;
  const unpaidCount  = orders.filter((o) => o.payment_status === 'Unpaid').length;

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchName   = o.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchDay    = dayFilter === 'All'   || o.pickup_day     === dayFilter;
      const matchStatus = statusFilter === 'All' || o.payment_status === statusFilter;
      return matchName && matchDay && matchStatus;
    });
  }, [orders, search, dayFilter, statusFilter]);

  const handleMarkPaid = (id: string, paid: boolean) =>
    setOrders((prev) =>
      prev.map((o) => o.id === id ? { ...o, payment_status: paid ? 'Paid' : 'Unpaid' } : o)
    );

  const handlePaymentMethodChange = (id: string, method: PaymentMethod) =>
    setOrders((prev) =>
      prev.map((o) => o.id === id ? { ...o, payment_method: method } : o)
    );

  const handleAddOrder = (newOrder: Omit<LaundryOrder, 'id' | 'created_at'>) =>
    setOrders((prev) => [
      { ...newOrder, id: `lo-${Date.now()}`, created_at: new Date().toISOString() },
      ...prev,
    ]);

  const hasFilters = search || dayFilter !== 'All' || statusFilter !== 'All';

  return (
    <>
      <AddLaundryModal opened={modalOpened} onClose={close} onSave={handleAddOrder} />

      <Box style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

        {/* Top bar */}
        <Box px={16} py={12} style={{ backgroundColor:'white', borderBottom:'0.5px solid #e2e8f0', position:'sticky', top:0, zIndex:10 }}>
          <Flex align="center" justify="space-between" mb={12}>
            <Group gap={8}>
              <Box style={{ width:30, height:30, borderRadius:8, backgroundColor:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <IconWashMachine size={16} color="white" />
              </Box>
              <Stack gap={0}>
                <Text fw={700} size="sm" style={{ color:'#0f172a', letterSpacing:'-0.01em' }}>Laundry Orders</Text>
                <Text size="10px" c="dimmed">Aqua Crystal POS</Text>
              </Stack>
            </Group>
            <Group gap={8}>
              <Badge size="sm" variant="light" color="green" radius="sm">{paidCount} paid</Badge>
              <Badge size="sm" variant="light" color="yellow" radius="sm">{unpaidCount} pending</Badge>
            </Group>
          </Flex>

          {/* Revenue strip */}
          <Box style={{ backgroundColor:'#eff6ff', border:'0.5px solid #bfdbfe', borderRadius:10, padding:'8px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <Text size="11px" fw={600} c="dimmed" style={{ textTransform:'uppercase', letterSpacing:'0.07em' }}>Total Revenue</Text>
            <Text fw={800} size="md" style={{ color:'#1d4ed8', fontVariantNumeric:'tabular-nums' }}>
              ₱{totalRevenue.toLocaleString('en-PH')}
            </Text>
          </Box>

          {/* Search */}
          <TextInput
            placeholder="Search customer name..."
            leftSection={<IconSearch size={14} />}
            rightSection={search ? <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setSearch('')}><IconX size={12} /></ActionIcon> : null}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="xl"
            size="sm"
            mb={10}
            styles={{ input: { backgroundColor:'#f1f5f9', border:'0.5px solid #e2e8f0', fontSize:13 } }}
          />

          {/* Filters */}
          <Flex gap={8} align="center" wrap="nowrap">
            <IconFilter size={13} color="#94a3b8" style={{ flexShrink:0 }} />
            <Select
              size="xs"
              placeholder="All days"
              data={[{ value:'All', label:'All days' }, ...PICKUP_DAYS.map((d) => ({ value:d, label:d }))]}
              value={dayFilter}
              onChange={(v) => setDayFilter((v ?? 'All') as PickupDay | 'All')}
              radius="xl"
              style={{ flex:1, minWidth:110 }}
              styles={{ input: { fontSize:12, backgroundColor:'#f1f5f9', border:'0.5px solid #e2e8f0' } }}
            />
            <SegmentedControl
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as PaymentStatus | 'All')}
              data={[{ label:'All', value:'All' }, { label:'✓ Paid', value:'Paid' }, { label:'⏳ Pending', value:'Unpaid' }]}
              size="xs"
              radius="xl"
              styles={{
                root: { backgroundColor:'#f1f5f9', border:'0.5px solid #e2e8f0' },
                indicator: { borderRadius:99 },
                label: { fontSize:11, fontWeight:600 },
              }}
            />
          </Flex>
        </Box>

        {/* Cards */}
        <Box px={16} py={12}>
          {filtered.length === 0 ? (
            <Flex direction="column" align="center" justify="center" style={{ minHeight:200 }} gap={8}>
              <IconWashMachine size={40} color="#cbd5e1" />
              <Text size="sm" c="dimmed">{hasFilters ? 'No orders match your filters.' : 'No orders yet.'}</Text>
              {hasFilters && (
                <Text size="xs" c="blue" style={{ cursor:'pointer', textDecoration:'underline' }}
                  onClick={() => { setSearch(''); setDayFilter('All'); setStatusFilter('All'); }}>
                  Clear filters
                </Text>
              )}
            </Flex>
          ) : (
            <Stack gap={10}>
              {filtered.map((order) => (
                <LaundryOrderCard
                  key={order.id}
                  order={order}
                  onMarkPaid={handleMarkPaid}
                  onPaymentMethodChange={handlePaymentMethodChange}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* FAB */}
        <Tooltip label="New laundry order" position="left" withArrow>
          <ActionIcon
            size={52}
            radius="xl"
            color="blue"
            variant="filled"
            onClick={open}
            aria-label="Add new laundry order"
            style={{ position:'fixed', bottom:24, right:24, boxShadow:'0 4px 16px rgba(37,99,235,0.35)', zIndex:100 }}
          >
            <Text fw={700} size="xl" style={{ lineHeight:1 }}>+</Text>
          </ActionIcon>
        </Tooltip>

      </Box>
    </>
  );
}

