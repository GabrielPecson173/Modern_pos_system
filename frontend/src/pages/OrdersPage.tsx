import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Flex,
  Text,
  Badge,
  ActionIcon,
  Button,
  Alert,
  Skeleton,
  ScrollArea,
} from '@mantine/core';
import { IconDots, IconCalendar, IconPlus, IconTrash } from '@tabler/icons-react';
import { RootState, AppDispatch } from '../store';
import {
  fetchOrders,
  addRow,
  removeRow,
  clearError,
  Order,
} from '../store/ordersSlice';

const ORDER_TYPE_BADGES: Record<string, { color: string; label: string }> = {
  'Walk-in':  { color: 'teal', label: 'WALK-IN'  },
  'Phone':    { color: 'blue', label: 'PHONE'    },
  'Delivery': { color: 'teal', label: 'DELIVERY' },
  'Pickup':   { color: 'blue', label: 'PICKUP'   },
  '':         { color: 'gray', label: '—'        },
};

const getBadge = (type: string) =>
  ORDER_TYPE_BADGES[type] ?? { color: 'gray', label: type || '—' };

const today = new Date().toLocaleDateString('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
});

function OrderRow({ row, index, dispatch }: { row: Order; index: number; dispatch: AppDispatch }) {
  return (
    <tr>
      <td style={styles.rowNum}>{index + 1}</td>
      <td style={styles.cell}>
        <Text size="sm" style={{ fontSize: 12 }}>
          {row.name || '—'}
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
            onClick={() => dispatch(removeRow(row.id))}
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

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

const grandTotal = items.reduce((sum, r) => sum + (r.total ? Number(r.total) : 0), 0);

  return (
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
          <Badge
            leftSection={<IconCalendar size={10} />}
            variant="light"
            color="gray"
            radius="sm"
            size="sm"
          >
            {today}
          </Badge>
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
                {items.map((row, idx) => (
                  <OrderRow key={row.id} row={row} index={idx} dispatch={dispatch} />
                ))}
              </tbody>
            </table>
          )}

          {/* Add row */}
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconPlus size={12} />}
            mt={8}
            onClick={() => dispatch(addRow())}
            style={{ border: '0.5px dashed var(--mantine-color-gray-4)', width: '100%' }}
          >
            Add empty row
          </Button>

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
