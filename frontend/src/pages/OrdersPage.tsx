import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Flex,
  Text,
  Badge,
  ActionIcon,
  Alert,
  Skeleton,
  ScrollArea,
  Tooltip,
  Popover,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconDots, IconCalendar, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import { RootState, AppDispatch } from '../store';
import {
  fetchOrders,
  deleteOrder,
  clearError,
  Order,
} from '../store/ordersSlice';
import { AddOrderModal } from '../components/AddOrderModal';

const ORDER_TYPE_BADGES: Record<string, { color: string; label: string }> = {
  'Walk-in':  { color: 'teal', label: 'WALK-IN'  },
  'Phone':    { color: 'blue', label: 'PHONE'    },
  'Delivery': { color: 'teal', label: 'DELIVERY' },
  'Pickup':   { color: 'blue', label: 'PICKUP'   },
  '':         { color: 'gray', label: '—'        },
};

const getBadge = (type: string) =>
  ORDER_TYPE_BADGES[type] ?? { color: 'gray', label: type || '—' };

function OrderRow({ row, index, dispatch }: { row: Order; index: number; dispatch: AppDispatch }) {
  return (
    <tr>
      <td style={styles.rowNum}>{index + 1}</td>
      <td style={styles.cell}>
        <Text size="sm" style={{ fontSize: 12 }}>
          {row.customer_name || '—'}
        </Text>
      </td>
      <td style={styles.cell}>
        <Badge
          size="xs"
          color={getBadge(row.order_type).color}
          radius="sm"
        >
          {getBadge(row.order_type).label}
        </Badge>
      </td>
      <td style={styles.cell}>
        <Text size="sm" style={{ fontSize: 12 }}>
          {row.product || '—'}
        </Text>
      </td>
      <td style={styles.cell}>
        <Text size="sm" style={{ fontSize: 12 }}>
          {row.quantity !== '' ? Number(row.quantity).toString() : '—'}
        </Text>
      </td>
      <td style={styles.cell}>
        <Text size="sm" style={{ fontSize: 12 }}>
          {row.unit_price !== '' ? `₱${Number(row.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}
        </Text>
      </td>
      <td style={{ ...styles.cell, ...styles.totalCell }}>
        <Flex align="center" justify="space-between" gap={4}>
          <Text size="sm" fw={500} c="dark">
            {row.total !== '' ? `₱${Number(row.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}
          </Text>
          <ActionIcon
            size="xs"
            variant="subtle"
            color="red"
            opacity={0}
            className="delete-btn"
            onClick={() => dispatch(deleteOrder(row.id))}
          >
            <IconTrash size={11} />
          </ActionIcon>
        </Flex>
      </td>
    </tr>
  );
}

export function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.orders);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [calendarOpened, { toggle: toggleCalendar, close: closeCalendar }] = useDisclosure(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter items by selected date's order_date
  const filteredItems = selectedDate
    ? items.filter((r) => {
        if (!r.order_date) return false;
        // Use plain string comparison to avoid UTC vs local timezone shift
        // r.order_date is "YYYY-MM-DD" from Django; selectedDate is a local Date
        const orderDateStr = r.order_date.slice(0, 10);
        const selectedStr = [
          selectedDate.getFullYear(),
          String(selectedDate.getMonth() + 1).padStart(2, '0'),
          String(selectedDate.getDate()).padStart(2, '0'),
        ].join('-');
        return orderDateStr === selectedStr;
      })
    : items;

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    closeCalendar();
  };

  const clearDateFilter = () => setSelectedDate(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

const grandTotal = filteredItems.reduce((sum, r) => sum + (r.total ? Number(r.total) : 0), 0);

  return (
    <>
      <AddOrderModal opened={modalOpened} onClose={closeModal} />

      <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top bar */}
      <Flex
        align="center"
        justify="space-between"
        px={16}
        py={10}
        style={{
          borderBottom: '0.5px solid var(--mantine-color-gray-3)',
          backgroundColor: 'white',
          flexShrink: 0,
        }}
      >
        <Flex align="center" gap={8}>
          <ActionIcon variant="subtle" color="gray" size="sm">
            <IconDots size={16} />
          </ActionIcon>
          <Text fw={500} size="sm">Aqua Crystal</Text>
          <Text size="xs" c="dimmed">Water Orders</Text>
        </Flex>
        <Flex align="center" gap={8}>
          {/* Active date filter chip */}
          {selectedDate && (
            <Badge
              variant="light"
              color="teal"
              radius="sm"
              size="sm"
              rightSection={
                <ActionIcon
                  size={10}
                  variant="transparent"
                  color="teal"
                  onClick={clearDateFilter}
                >
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Badge>
          )}

          {/* Calendar popover */}
          <Popover
            opened={calendarOpened}
            onClose={closeCalendar}
            position="bottom-end"
            shadow="md"
            radius="lg"
            withArrow
          >
            <Popover.Target>
              <Tooltip label={selectedDate ? 'Change date filter' : 'Filter by date'} withArrow>
                <ActionIcon
                  variant={selectedDate ? 'light' : 'subtle'}
                  color={selectedDate ? 'teal' : 'gray'}
                  size="sm"
                  onClick={toggleCalendar}
                >
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
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const d = new Date(date);
                  d.setHours(0, 0, 0, 0);

                  const isFuture = d > today;
                  const isToday = d.getTime() === today.getTime();
                  const isSelected =
                    selectedDate !== null &&
                    date.getFullYear() === selectedDate.getFullYear() &&
                    date.getMonth()    === selectedDate.getMonth() &&
                    date.getDate()     === selectedDate.getDate();

                  return {
                    selected: isSelected,
                    disabled: isFuture,
                    style: {
                      ...(isSelected && {
                        backgroundColor: 'var(--mantine-color-teal-6)',
                        color: 'white',
                        borderRadius: '50%',
                        fontWeight: 700,
                      }),
                      ...(isToday && !isSelected && {
                        border: '2px solid var(--mantine-color-teal-5)',
                        borderRadius: '50%',
                        fontWeight: 700,
                        color: 'var(--mantine-color-teal-7)',
                      }),
                      ...(isFuture && {
                        opacity: 0.25,
                        cursor: 'not-allowed',
                        pointerEvents: 'none' as const,
                      }),
                    },
                    onClick: isFuture ? undefined : () => handleDayClick(date),
                  };
                }}
              />
            </Popover.Dropdown>
          </Popover>

          <ActionIcon variant="subtle" color="gray" size="sm">
            <IconDots size={16} />
          </ActionIcon>
        </Flex>
      </Flex>

      {/* Error alert */}
      {error && (
        <Alert color="red" m={12} onClose={() => dispatch(clearError())} withCloseButton>
          {error}
        </Alert>
      )}

      {/* Table */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        <Box p={12}>
          <style>{`
            tr:hover .delete-btn { opacity: 1 !important; }
            tr { transition: background 0.1s; }
            tr:hover td { background: #f8f9fa; }
          `}</style>

          {loading ? (
            <Box>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height={36} mb={4} radius="sm" />
              ))}
            </Box>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thNum}></th>
                  {['Name', 'Order Type', 'Product', 'Quantity', 'Unit Price', 'Total'].map((col) => (
                    <th key={col} style={styles.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--mantine-color-gray-5)', fontSize: 13 }}>
                      No orders found for {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((row, idx) => (
                    <OrderRow key={row.id} row={row} index={idx} dispatch={dispatch} />
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Grand total */}
          {grandTotal > 0 && (
            <Flex justify="flex-end" mt={12} pr={8}>
              <Text size="sm" fw={500} c="teal">
                Grand Total: ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            </Flex>
          )}
        </Box>
      </ScrollArea>
      </Box>

      {/* FAB */}
      <Tooltip label="New water order" position="left" withArrow>
        <ActionIcon
          size={52}
          radius="xl"
          color="teal"
          variant="filled"
          onClick={openModal}
          aria-label="Add new water order"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: '0 4px 16px rgba(15,118,110,0.35)',
            zIndex: 100,
          }}
        >
          <IconPlus size={22} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'separate' as const,
    borderSpacing: '0 3px',
    minWidth: 620,
  },
  thNum: {
    width: 32,
    padding: '8px 4px',
    fontSize: 11,
    color: 'var(--mantine-color-gray-5)',
    fontWeight: 400,
    textAlign: 'right' as const,
  },
  th: {
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--mantine-color-gray-7)',
    backgroundColor: 'var(--mantine-color-gray-1)',
    border: '0.5px solid var(--mantine-color-gray-3)',
    textAlign: 'left' as const,
  },
  rowNum: {
    width: 32,
    padding: '6px 8px 6px 0',
    fontSize: 11,
    color: 'var(--mantine-color-gray-5)',
    textAlign: 'right' as const,
    verticalAlign: 'middle' as const,
  },
  cell: {
    padding: '4px 8px',
    fontSize: 12,
    backgroundColor: 'white',
    border: '0.5px solid var(--mantine-color-gray-2)',
    verticalAlign: 'middle' as const,
    minWidth: 80,
  },
  totalCell: {
    minWidth: 100,
  },
};
