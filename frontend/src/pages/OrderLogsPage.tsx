import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Text,
  Flex,
  TextInput,
  Center,
  Badge,
  Group,
  SegmentedControl,
  ThemeIcon,
} from '@mantine/core';
import {
  IconSearch,
  IconChevronRight,
  IconDroplet,
  IconWashMachine,
  IconClipboardList,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import 'mantine-datatable/styles.css';

import { RootState, AppDispatch } from '../store';
import { fetchOrders } from '../store/ordersSlice';
import { fetchLaundryOrders } from '../store/laundrySlice';

const PAGE_SIZE = 25;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const formatPHP = (value: number | string) =>
  `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

interface LogEntry {
  logId:         string;
  source:        'water' | 'laundry';
  customer_name: string;
  details:       string;       // product/pickup day
  amount:        number;
  status:        string;       // paid/unpaid/n-a
  created_at:    string;
  order_date?:   string;
}

export function OrderLogsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: waterOrders,   loading: waterLoading   } = useSelector((s: RootState) => s.orders);
  const { items: laundryOrders, loading: laundryLoading } = useSelector((s: RootState) => s.laundry);

  const [search,       setSearch]       = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'water' | 'laundry'>('All');
  const [page,         setPage]         = useState(1);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchLaundryOrders());
  }, [dispatch]);

  // Build unified log entries
  const allLogs: LogEntry[] = [
    ...waterOrders.map((o) => ({
      logId:         `water-${o.id}`,
      source:        'water' as const,
      customer_name: o.customer_name || '—',
      details:       o.product       || o.order_type || '—',
      amount:        o.total ? Number(o.total) : 0,
      status:        'n/a',
      created_at:    o.created_at || o.order_date || '',
      order_date:    o.order_date,
    })),
    ...laundryOrders.map((o) => ({
      logId:         `laundry-${o.id}`,
      source:        'laundry' as const,
      customer_name: o.customer_name,
      details:       `${o.pickup_day} pickup`,
      amount:        Number(o.total_php),
      status:        o.payment_status,
      created_at:    o.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter
  const filtered = allLogs.filter((log) => {
    const matchSource = sourceFilter === 'All' || log.source === sourceFilter;
    const q = search.toLowerCase();
    const matchSearch =
      log.customer_name.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    return matchSource && matchSearch;
  });

  useEffect(() => { setPage(1); }, [search, sourceFilter]);

  const from  = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(from, from + PAGE_SIZE);
  const loading = waterLoading || laundryLoading;

  const totalRevenue = filtered.reduce((s, l) => s + l.amount, 0);

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <Box
        px={16} py={10}
        style={{
          backgroundColor: 'white',
          borderBottom: '0.5px solid #e2e8f0',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        <Flex align="center" justify="space-between" mb={12}>
          {/* Breadcrumb */}
          <Flex align="center" gap={6}>
            <Text size="sm" fw={600} c="teal" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              Dashboard
            </Text>
            <IconChevronRight size={14} color="#94a3b8" />
            <Text size="sm" fw={500} c="dimmed">Order Logs</Text>
          </Flex>

          {/* Total */}
          <Text size="sm" fw={700} c="violet" ff="monospace">
            {filtered.length} orders · {formatPHP(totalRevenue)}
          </Text>
        </Flex>

        {/* Search + filter row */}
        <Flex gap={10} align="center">
          <TextInput
            placeholder="Search customer or details..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="xl"
            size="sm"
            style={{ flex: 1 }}
            styles={{ input: { backgroundColor: '#f1f5f9', border: '0.5px solid #e2e8f0', fontSize: 13 } }}
          />
          <SegmentedControl
            value={sourceFilter}
            onChange={(v) => setSourceFilter(v as 'All' | 'water' | 'laundry')}
            data={[
              { label: 'All',     value: 'All'     },
              { label: 'Water',   value: 'water'   },
              { label: 'Laundry', value: 'laundry' },
            ]}
            size="xs"
            radius="xl"
            styles={{
              root:      { backgroundColor: '#f1f5f9', border: '0.5px solid #e2e8f0' },
              indicator: { borderRadius: 99 },
              label:     { fontSize: 11, fontWeight: 600 },
            }}
          />
        </Flex>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Box p={12} style={{ flex: 1 }}>
        <DataTable
          withTableBorder
          borderRadius="md"
          highlightOnHover
          fetching={loading}
          records={paged}
          idAccessor="logId"
          totalRecords={filtered.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          paginationText={({ from, to, totalRecords }) =>
            `Showing ${from}–${to} of ${totalRecords} orders`
          }
          paginationActiveBackgroundColor="#038F8D"
          emptyState={
            <Center py="xl">
              <Flex direction="column" align="center" gap={8}>
                <IconClipboardList size={36} color="#cbd5e1" />
                <Text c="dimmed" size="sm">No orders found.</Text>
              </Flex>
            </Center>
          }
          columns={[
            {
              accessor: 'source',
              title: 'Service',
              width: 100,
              render: (log: LogEntry) => (
                <Group gap={6}>
                  <ThemeIcon
                    size={22} radius="sm"
                    color={log.source === 'water' ? 'teal' : 'blue'}
                    variant="light"
                  >
                    {log.source === 'water'
                      ? <IconDroplet size={12} />
                      : <IconWashMachine size={12} />}
                  </ThemeIcon>
                  <Text size="sm" fw={500} c={log.source === 'water' ? 'teal' : 'blue'}>
                    {log.source === 'water' ? 'Water' : 'Laundry'}
                  </Text>
                </Group>
              ),
            },
            {
              accessor: 'customer_name',
              title: 'Customer',
              render: (log: LogEntry) => (
                <Text size="sm" fw={600}>{log.customer_name}</Text>
              ),
            },
            {
              accessor: 'details',
              title: 'Details',
              render: (log: LogEntry) => (
                <Text size="sm" c="dimmed">{log.details}</Text>
              ),
            },
            {
              accessor: 'status',
              title: 'Status',
              width: 100,
              render: (log: LogEntry) => {
                if (log.status === 'n/a') {
                  return <Text size="xs" c="dimmed">—</Text>;
                }
                return (
                  <Badge
                    size="sm"
                    variant="light"
                    color={log.status === 'Paid' ? 'green' : 'yellow'}
                    radius="sm"
                  >
                    {log.status}
                  </Badge>
                );
              },
            },
            {
              accessor: 'amount',
              title: 'Amount',
              width: 130,
              textAlign: 'right',
              render: (log: LogEntry) => (
                <Text size="sm" fw={700} ff="monospace"
                  c={log.source === 'water' ? 'teal' : 'blue'}>
                  {formatPHP(log.amount)}
                </Text>
              ),
            },
            {
              accessor: 'created_at',
              title: 'Date & Time',
              width: 200,
              render: (log: LogEntry) => (
                <Text size="sm" c="dimmed">{log.created_at ? formatDate(log.created_at) : '—'}</Text>
              ),
            },
          ]}
        />
      </Box>
    </Box>
  );
}
