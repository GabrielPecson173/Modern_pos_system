import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Flex, Text, ActionIcon, Alert, Tooltip,
  Popover, Center, Button, Badge,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { DataTable } from 'mantine-datatable';
import { IconChevronRight, IconCalendar, IconX, IconClipboardList } from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.css';
import { RootState, AppDispatch } from '../store';
import { fetchLaundryOrders, clearLaundryError } from '../store/laundrySlice';
import { LaundryOrder, PaymentStatus } from '../components/laundry/laundry.types';

const PAGE_SIZE = 25;

const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  'Paid':   { label: 'PAID',    color: '#1a7f37', bg: '#dafbe1' },
  'Unpaid': { label: 'PENDING', color: '#9a6700', bg: '#fff8c5' },
};

const PICKUP_DAY_META: Record<string, { color: string; bg: string }> = {
  'Monday':    { color: '#0969da', bg: '#ddf4ff' },
  'Tuesday':   { color: '#6639ba', bg: '#f3eeff' },
  'Wednesday': { color: '#1a7f37', bg: '#dafbe1' },
  'Thursday':  { color: '#9a6700', bg: '#fff8c5' },
  'Friday':    { color: '#cf222e', bg: '#ffebe9' },
  'Saturday':  { color: '#0d7c6e', bg: '#e6faf8' },
  'Sunday':    { color: '#555',    bg: '#f0f0f0' },
};

const formatPHP = (value: number | string) =>
  `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export function LaundryLogsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((s: RootState) => s.laundry);

  const [calendarOpened, { toggle: toggleCalendar, close: closeCalendar }] = useDisclosure(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  useEffect(() => { dispatch(fetchLaundryOrders()); }, [dispatch]);
  useEffect(() => { setPage(1); }, [selectedDate, items.length]);

  const filteredItems = useMemo(() => {
    if (!selectedDate) return items;
    const sel = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0'),
    ].join('-');
    return items.filter((o) => o.created_at?.slice(0, 10) === sel);
  }, [items, selectedDate]);

  const from        = (page - 1) * pageSize;
  const pagedItems  = filteredItems.slice(from, from + pageSize);
  const grandTotal  = filteredItems.reduce((s, o) => s + Number(o.total_php ?? 0), 0);
  const paidCount   = filteredItems.filter((o) => o.payment_status === 'Paid').length;
  const unpaidCount = filteredItems.filter((o) => o.payment_status === 'Unpaid').length;

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
            <Text size="sm" fw={600} c="blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/laundry')}>
              Laundry
            </Text>
            <IconChevronRight size={14} color="#94a3b8" />
            <Text size="sm" fw={500} c="dimmed">Order Logs</Text>
          </Flex>

          <Flex align="center" gap={8}>
            <Badge size="sm" variant="light" color="green"  radius="sm">{paidCount} paid</Badge>
            <Badge size="sm" variant="light" color="yellow" radius="sm">{unpaidCount} pending</Badge>

            {dateLabel && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                {dateLabel}
                <IconX size={11} style={{ cursor: 'pointer', marginLeft: 2 }} onClick={() => setSelectedDate(null)} />
              </span>
            )}

            <Popover opened={calendarOpened} onClose={closeCalendar} position="bottom-end" shadow="md" radius="lg" withArrow>
              <Popover.Target>
                <Tooltip label={dateLabel ? 'Change date' : 'Filter by date'} withArrow>
                  <ActionIcon variant={dateLabel ? 'light' : 'subtle'} color={dateLabel ? 'blue' : 'gray'} size="sm" onClick={toggleCalendar}>
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
                        ...(isSelected && { backgroundColor: 'var(--mantine-color-blue-6)', color: 'white', borderRadius: '50%', fontWeight: 700 }),
                        ...(isToday && !isSelected && { border: '2px solid var(--mantine-color-blue-5)', borderRadius: '50%', fontWeight: 700, color: 'var(--mantine-color-blue-7)' }),
                        ...(isFuture && { opacity: 0.25, cursor: 'not-allowed', pointerEvents: 'none' as const }),
                      },
                      onClick: isFuture ? undefined : () => handleDayClick(date),
                    };
                  }}
                />
              </Popover.Dropdown>
            </Popover>

            <Button size="xs" variant="light" color="blue" onClick={() => navigate('/laundry')} radius="md">
              ← Back to Laundry
            </Button>
          </Flex>
        </Flex>

        {error && (
          <Alert color="red" m={12} onClose={() => dispatch(clearLaundryError())} withCloseButton>
            {error}
          </Alert>
        )}

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
            paginationActiveBackgroundColor="#1d4ed8"
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
                render: (_row: LaundryOrder, idx: number) => (
                  <Text size="sm" c="dimmed" ff="monospace">#{from + idx + 1}</Text>
                ),
              },
              {
                accessor: 'customer_name', title: 'Name',
                render: (row: LaundryOrder) => (
                  <Text size="sm" fw={600}>{row.customer_name || '—'}</Text>
                ),
              },
              {
                accessor: 'pickup_day', title: 'Pickup Day', width: 120,
                render: (row: LaundryOrder) => {
                  const meta = PICKUP_DAY_META[row.pickup_day] ?? { color: '#555', bg: '#f0f0f0' };
                  return (
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: meta.color, backgroundColor: meta.bg }}>
                      {row.pickup_day || '—'}
                    </span>
                  );
                },
              },
              {
                accessor: 'items', title: 'Items',
                render: (row: LaundryOrder) => {
                  const summary = row.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ');
                  return <Text size="sm" lineClamp={1}>{summary || '—'}</Text>;
                },
              },
              {
                accessor: 'weight_kg', title: 'Weight', width: 90, textAlign: 'right',
                render: (row: LaundryOrder) => (
                  <Text size="sm">{row.weight_kg ? `${row.weight_kg} kg` : '—'}</Text>
                ),
              },
              {
                accessor: 'payment_method', title: 'Payment', width: 100,
                render: (row: LaundryOrder) => (
                  <Text size="sm" c="dimmed">{row.payment_method || '—'}</Text>
                ),
              },
              {
                accessor: 'payment_status', title: 'Status', width: 100,
                render: (row: LaundryOrder) => {
                  const meta = PAYMENT_STATUS_META[row.payment_status as PaymentStatus]
                    ?? { label: row.payment_status, color: '#555', bg: '#f0f0f0' };
                  return (
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: meta.color, backgroundColor: meta.bg }}>
                      {meta.label}
                    </span>
                  );
                },
              },
              {
                accessor: 'total_php', title: 'Total', width: 130, textAlign: 'right',
                render: (row: LaundryOrder) => (
                  <Text size="sm" fw={700} ff="monospace" c={row.total_php != null ? 'dark' : 'dimmed'}>
                    {row.total_php != null ? formatPHP(row.total_php) : '—'}
                  </Text>
                ),
              },
              {
                accessor: 'created_at', title: 'Date', width: 120,
                render: (row: LaundryOrder) => (
                  <Text size="sm" c="dimmed">{row.created_at?.slice(0, 10) || '—'}</Text>
                ),
              },
            ]}
          />

          {grandTotal > 0 && (
            <Flex justify="flex-end" mt={10} px={2}>
              <Text size="sm" fw={700} c="blue" ff="monospace">
                {dateLabel ? `${dateLabel} Total:` : 'Grand Total:'} {formatPHP(grandTotal)}
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </>
  );
}
