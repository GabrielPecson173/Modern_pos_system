import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Flex, Text, ActionIcon, Alert, Tooltip,
  Popover, Center, Button,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { DataTable } from 'mantine-datatable';
import { IconChevronRight, IconCalendar, IconX, IconClipboardList } from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.css';
import { RootState, AppDispatch } from '../store';
import { fetchOrders, clearError, Order } from '../store/ordersSlice';

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

export function WaterLogsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((s: RootState) => s.orders);
  const [calendarOpened, { toggle: toggleCalendar, close: closeCalendar }] = useDisclosure(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);
  useEffect(() => { setPage(1); }, [selectedDate, items.length]);

  const filteredItems = selectedDate
    ? items.filter((r) => {
        if (!r.order_date) return false;
        const sel = [
          selectedDate.getFullYear(),
          String(selectedDate.getMonth() + 1).padStart(2, '0'),
          String(selectedDate.getDate()).padStart(2, '0'),
        ].join('-');
        return r.order_date.slice(0, 10) === sel;
      })
    : items;

  const from      = (page - 1) * pageSize;
  const pagedItems = filteredItems.slice(from, from + pageSize);
  const grandTotal = filteredItems.reduce((s, r) => s + (r.total ? Number(r.total) : 0), 0);

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const handleDayClick = (date: Date) => { setSelectedDate(date); closeCalendar(); };

  return (
    <>
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* ── Top bar ── */}
        <Flex align="center" justify="space-between" px={16} py={10}
          style={{ borderBottom: '0.5px solid var(--mantine-color-gray-3)', backgroundColor: 'white', flexShrink: 0 }}>
          <Flex align="center" gap={6}>
            <Text size="sm" fw={600} c="teal" style={{ cursor: 'pointer' }} onClick={() => navigate('/water')}>
              Water
            </Text>
            <IconChevronRight size={14} color="#94a3b8" />
            <Text size="sm" fw={500} c="dimmed">Order Logs</Text>
          </Flex>

          <Flex align="center" gap={8}>
            {dateLabel && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#0d7c6e', backgroundColor: '#e6faf8', border: '1px solid #b2dfdb' }}>
                {dateLabel}
                <IconX size={11} style={{ cursor: 'pointer', marginLeft: 2 }} onClick={() => setSelectedDate(null)} />
              </span>
            )}

            <Popover opened={calendarOpened} onClose={closeCalendar} position="bottom-end" shadow="md" radius="lg" withArrow>
              <Popover.Target>
                <Tooltip label={dateLabel ? 'Change date' : 'Filter by date'} withArrow>
                  <ActionIcon variant={dateLabel ? 'light' : 'subtle'} color={dateLabel ? 'teal' : 'gray'} size="sm" onClick={toggleCalendar}>
                    <IconCalendar size={16} />
                  </ActionIcon>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown p={8}>
                <Calendar
                  value={selectedDate}
                  onChange={(date) => { if (date) handleDayClick(date); }}
                  size="sm"
                  getDayProps={(date) => {
                    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
                    const d = new Date(date); d.setHours(0, 0, 0, 0);
                    const isFuture   = d > todayDate;
                    const isToday    = d.getTime() === todayDate.getTime();
                    const isSelected = selectedDate !== null &&
                      date.getFullYear() === selectedDate.getFullYear() &&
                      date.getMonth()    === selectedDate.getMonth() &&
                      date.getDate()     === selectedDate.getDate();
                    return {
                      selected: isSelected, disabled: isFuture,
                      style: {
                        ...(isSelected && { backgroundColor: 'var(--mantine-color-teal-6)', color: 'white', borderRadius: '50%', fontWeight: 700 }),
                        ...(isToday && !isSelected && { border: '2px solid var(--mantine-color-teal-5)', borderRadius: '50%', fontWeight: 700, color: 'var(--mantine-color-teal-7)' }),
                        ...(isFuture && { opacity: 0.25, cursor: 'not-allowed', pointerEvents: 'none' as const }),
                      },
                      onClick: isFuture ? undefined : () => handleDayClick(date),
                    };
                  }}
                />
              </Popover.Dropdown>
            </Popover>

            <Button size="xs" variant="light" color="teal" onClick={() => navigate('/water')} radius="md">
              ← Back to Water
            </Button>
          </Flex>
        </Flex>

        {error && <Alert color="red" m={12} onClose={() => dispatch(clearError())} withCloseButton>{error}</Alert>}

        {/* ── DataTable ── */}
        <Box p={12} style={{ flex: 1, overflow: 'hidden' }}>
          <DataTable
            withTableBorder borderRadius="md" highlightOnHover
            fetching={loading}
            records={pagedItems}
            idAccessor="id"
            totalRecords={filteredItems.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={[10, 25, 50]}
            onRecordsPerPageChange={(size) => { setPageSize(size); setPage(1); }}
            paginationText={({ totalRecords }) => `${totalRecords} orders`}
            paginationActiveBackgroundColor="#038F8D"
            emptyState={
              <Center py="xl">
                <Flex direction="column" align="center" gap={8}>
                  <IconClipboardList size={36} color="#cbd5e1" />
                  <Text c="dimmed" size="sm">
                    {selectedDate ? `No orders for ${dateLabel}.` : 'No orders yet.'}
                  </Text>
                </Flex>
              </Center>
            }
            columns={[
              {
                accessor: 'id', title: '#', width: 50,
                render: (_row: Order, idx: number) => <Text size="sm" c="dimmed" ff="monospace">#{from + idx + 1}</Text>,
              },
              {
                accessor: 'customer_name', title: 'Name',
                render: (row: Order) => <Text size="sm" fw={600}>{row.customer_name || '—'}</Text>,
              },
              {
                accessor: 'order_type', title: 'Order Type', width: 120,
                render: (row: Order) => {
                  const meta = getOrderTypeMeta(row.order_type);
                  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: meta.color, backgroundColor: meta.bg }}>{meta.label}</span>;
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
                  <Text size="sm" fw={700} ff="monospace" c={row.total !== '' ? 'dark' : 'dimmed'}>
                    {row.total !== '' ? formatPHP(row.total) : '—'}
                  </Text>
                ),
              },
              {
                accessor: 'order_date', title: 'Date', width: 120,
                render: (row: Order) => <Text size="sm" c="dimmed">{row.order_date || '—'}</Text>,
              },
            ]}
          />

          {grandTotal > 0 && (
            <Flex justify="flex-end" mt={10} px={2}>
              <Text size="sm" fw={700} c="teal" ff="monospace">
                {dateLabel ? `${dateLabel} Total:` : 'Grand Total:'} {formatPHP(grandTotal)}
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </>
  );
}
