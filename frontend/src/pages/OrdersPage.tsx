import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Flex, Text, ActionIcon, Alert, Center, Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DataTable } from 'mantine-datatable';
import { IconChevronRight, IconPlus, IconTrash, IconCash } from '@tabler/icons-react';
import 'mantine-datatable/styles.css';
import { RootState, AppDispatch } from '../store';
import { fetchOrders, deleteOrder, clearError, Order } from '../store/ordersSlice';
import { AddOrderModal } from '../components/AddOrderModal';

const PAGE_SIZE = 25;

const ORDER_TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  'Walk-in':  { label: 'WALK-IN',  color: '#0969da', bg: '#ddf4ff' },
  'Phone':    { label: 'PHONE',    color: '#6639ba', bg: '#f3eeff' },
  'Delivery': { label: 'DELIVERY', color: '#1a7f37', bg: '#dafbe1' },
  'Pickup':   { label: 'PICKUP',   color: '#9a6700', bg: '#fff8c5' },
  '':         { label: '—',        color: '#555',    bg: '#f0f0f0' },
};

const getOrderTypeMeta = (type: string) =>
  ORDER_TYPE_META[type] ?? { label: type.toUpperCase(), color: '#555', bg: '#f0f0f0' };

const formatPHP = (value: number | string) =>
  `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

function todayStr() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

export function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((s: RootState) => s.orders);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const today = todayStr();

  // Only today's orders
  const todayItems = items.filter((r) => r.order_date?.slice(0, 10) === today);

  const todayRevenue = todayItems.reduce((sum, r) => sum + (r.total ? Number(r.total) : 0), 0);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  return (
    <>
      <AddOrderModal opened={modalOpened} onClose={closeModal} />

      <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* ── Top bar ── */}
        <Flex
          align="center" justify="space-between"
          px={16} py={10}
          style={{ borderBottom: '0.5px solid var(--mantine-color-gray-3)', backgroundColor: 'white', flexShrink: 0 }}
        >
          <Flex align="center" gap={6}>
            <Text size="sm" fw={600} c="teal" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              Dashboard
            </Text>
            <IconChevronRight size={14} color="#94a3b8" />
            <Text size="sm" fw={500} c="dimmed">Water</Text>
          </Flex>

          <Button size="xs" color="teal" leftSection={<IconPlus size={13} />} onClick={openModal} radius="md">
            New Order
          </Button>
        </Flex>

        {/* ── Today's Revenue Strip ── */}
        <Box mx={12} mt={12} style={{
          backgroundColor: '#f0fdf9', border: '0.5px solid #99f6e4', borderRadius: 10,
          padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Flex align="center" gap={8}>
            <IconCash size={16} color="#0d9488" />
            <Text size="12px" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Today's Revenue
            </Text>
          </Flex>
          <Text fw={800} size="lg" style={{ color: '#0d9488', fontVariantNumeric: 'tabular-nums' }}>
            {formatPHP(todayRevenue)}
          </Text>
        </Box>

        {error && (
          <Alert color="red" m={12} onClose={() => dispatch(clearError())} withCloseButton>{error}</Alert>
        )}

        {/* ── DataTable ── */}
        <Box p={12} style={{ flex: 1, overflow: 'hidden' }}>
          <DataTable
            withTableBorder borderRadius="md" highlightOnHover
            fetching={loading}
            records={todayItems}
            idAccessor="id"
            totalRecords={todayItems.length}
            recordsPerPage={PAGE_SIZE}
            page={1}
            onPageChange={() => {}}
            paginationText={({ totalRecords }) => `${totalRecords} orders today`}
            paginationActiveBackgroundColor="#038F8D"
            emptyState={
              <Center py="xl">
                <Text c="dimmed" size="sm">No orders today yet.</Text>
              </Center>
            }
            columns={[
              {
                accessor: 'id', title: '#', width: 50,
                render: (_row: Order, idx: number) => (
                  <Text size="sm" c="dimmed" ff="monospace">#{idx + 1}</Text>
                ),
              },
              {
                accessor: 'customer_name', title: 'Name',
                render: (row: Order) => <Text size="sm" fw={600}>{row.customer_name || '—'}</Text>,
              },
              {
                accessor: 'order_type', title: 'Order Type', width: 120,
                render: (row: Order) => {
                  const meta = getOrderTypeMeta(row.order_type);
                  return (
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: meta.color, backgroundColor: meta.bg }}>
                      {meta.label}
                    </span>
                  );
                },
              },
              {
                accessor: 'product', title: 'Product',
                render: (row: Order) => <Text size="sm">{row.product || '—'}</Text>,
              },
              {
                accessor: 'quantity', title: 'Qty', width: 70, textAlign: 'right',
                render: (row: Order) => <Text size="sm">{row.quantity !== '' ? Number(row.quantity).toString() : '—'}</Text>,
              },
              {
                accessor: 'unit_price', title: 'Unit Price', width: 120, textAlign: 'right',
                render: (row: Order) => <Text size="sm" ff="monospace">{row.unit_price !== '' ? formatPHP(row.unit_price) : '—'}</Text>,
              },
              {
                accessor: 'total', title: 'Total', width: 130, textAlign: 'right',
                render: (row: Order) => (
                  <Flex align="center" justify="flex-end" gap={6}>
                    <Text size="sm" fw={700} ff="monospace" c={row.total !== '' ? 'dark' : 'dimmed'}>
                      {row.total !== '' ? formatPHP(row.total) : '—'}
                    </Text>
                    <ActionIcon size="xs" variant="subtle" color="red" opacity={0} className="delete-btn"
                      onClick={() => dispatch(deleteOrder(row.id))}>
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Flex>
                ),
              },
            ]}
          />
        </Box>
      </Box>
      <style>{`tr:hover .delete-btn { opacity: 1 !important; }`}</style>
    </>
  );
}
