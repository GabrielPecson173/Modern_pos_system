import { useState } from 'react';
import {
  Box,
  Text,
  Badge,
  Group,
  Stack,
  Checkbox,
  SegmentedControl,
  Divider,
  Collapse,
  ActionIcon,
  Flex,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconWeight,
} from '@tabler/icons-react';
import { LaundryOrder, PaymentMethod } from './laundry.types';

interface LaundryOrderCardProps {
  order: LaundryOrder;
  onMarkPaid: (id: string, paid: boolean) => void;
  onPaymentMethodChange: (id: string, method: PaymentMethod) => void;
}

const DAY_COLORS: Record<string, string> = {
  Monday:    'violet',
  Tuesday:   'indigo',
  Wednesday: 'cyan',
  Thursday:  'teal',
  Friday:    'blue',
  Saturday:  'orange',
  Sunday:    'red',
};

export function LaundryOrderCard({
  order,
  onMarkPaid,
  onPaymentMethodChange,
}: LaundryOrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isPaid = order.payment_status === 'Paid';
  const totalKg = order.items.reduce((s, i) => s + i.weight, 0);

  return (
    <Box
      style={{
        backgroundColor: 'white',
        borderRadius: 14,
        border: `1.5px solid ${isPaid ? '#d1fae5' : '#fef3c7'}`,
        boxShadow: expanded
          ? '0 4px 24px 0 rgba(15,23,42,0.08)'
          : '0 1px 4px 0 rgba(15,23,42,0.05)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* ── Collapsed header (always visible) ─────────────────────────── */}
      <Box
        px={16}
        py={14}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Flex align="center" justify="space-between" gap={8}>

          {/* Left: checkbox + name + day badge */}
          <Group gap={10} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Checkbox
              checked={isPaid}
              onChange={(e) => {
                e.stopPropagation();
                onMarkPaid(order.id, e.currentTarget.checked);
              }}
              color="green"
              radius="xl"
              size="sm"
              aria-label="Mark as paid"
              onClick={(e) => e.stopPropagation()}
              styles={{
                input: {
                  cursor: 'pointer',
                  borderColor: isPaid ? '#10b981' : '#d1d5db',
                },
              }}
            />
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Text
                fw={700}
                size="sm"
                style={{
                  color: '#0f172a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}
              >
                {order.customer_name}
              </Text>
              <Group gap={6}>
                <Badge
                  size="xs"
                  radius="xl"
                  color={DAY_COLORS[order.pickup_day] ?? 'gray'}
                  variant="light"
                  styles={{ label: { fontWeight: 600, fontSize: 10 } }}
                >
                  {order.pickup_day} Pickup
                </Badge>
                <Text size="10px" c="dimmed">{totalKg} kg total</Text>
              </Group>
            </Stack>
          </Group>

          {/* Right: total + status pill + chevron */}
          <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Stack gap={2} align="flex-end">
              <Text fw={800} size="sm" style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                ₱{order.total_php.toLocaleString('en-PH')}
              </Text>
              <Badge
                size="xs"
                radius="xl"
                variant="filled"
                color={isPaid ? 'green' : 'yellow'}
                styles={{
                  root: {
                    backgroundColor: isPaid ? '#d1fae5' : '#fef3c7',
                    color: isPaid ? '#065f46' : '#92400e',
                    fontWeight: 700,
                    fontSize: 10,
                    border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
                  },
                }}
              >
                {isPaid ? '✓ Paid' : '⏳ Pending'}
              </Badge>
            </Stack>

            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              style={{ transition: 'transform 0.2s' }}
            >
              {expanded ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
            </ActionIcon>
          </Group>

        </Flex>
      </Box>

      {/* ── Expanded body ──────────────────────────────────────────────── */}
      <Collapse in={expanded}>
        <Divider color="#f1f5f9" />
        <Box px={16} py={14}>
          <Stack gap={12}>

            {/* Item breakdown */}
            <Stack gap={6}>
              <Text size="10px" fw={700} c="dimmed" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Items
              </Text>
              {order.items.map((item) => (
                <Flex
                  key={item.id}
                  align="center"
                  justify="space-between"
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    padding: '8px 12px',
                    border: '0.5px solid #e2e8f0',
                  }}
                >
                  <Group gap={8}>
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#94a3b8',
                        flexShrink: 0,
                      }}
                    />
                    <Text size="sm" fw={500} style={{ color: '#1e293b' }}>
                      {item.label}
                    </Text>
                    <Group gap={3}>
                      <IconWeight size={11} color="#94a3b8" />
                      <Text size="xs" c="dimmed">{item.weight} kg</Text>
                    </Group>
                  </Group>
                  <Group gap={6}>
                    <Text size="10px" c="dimmed">
                      ₱{item.price_per_kg}/kg
                    </Text>
                    <Text size="sm" fw={600} style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                      ₱{(item.weight * item.price_per_kg).toLocaleString('en-PH')}
                    </Text>
                  </Group>
                </Flex>
              ))}
            </Stack>

            {/* Total row */}
            <Flex
              justify="space-between"
              align="center"
              style={{
                borderTop: '1.5px dashed #e2e8f0',
                paddingTop: 10,
              }}
            >
              <Text size="xs" fw={600} c="dimmed">Total</Text>
              <Text fw={800} size="md" style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                ₱{order.total_php.toLocaleString('en-PH')}
              </Text>
            </Flex>

            {/* Payment method toggle */}
            <Stack gap={6}>
              <Text size="10px" fw={700} c="dimmed" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Payment Method
              </Text>
              <SegmentedControl
                value={order.payment_method}
                onChange={(v) => onPaymentMethodChange(order.id, v as PaymentMethod)}
                data={[
                  { label: '💵  Cash', value: 'Cash' },
                  { label: '📱  GCash', value: 'GCash' },
                ]}
                size="xs"
                radius="xl"
                fullWidth
                styles={{
                  root: {
                    backgroundColor: '#f1f5f9',
                    border: '0.5px solid #e2e8f0',
                  },
                  indicator: {
                    backgroundColor: order.payment_method === 'GCash' ? '#3b82f6' : '#10b981',
                    borderRadius: 99,
                  },
                  label: { fontWeight: 600, fontSize: 12 },
                }}
              />
            </Stack>

            {/* Notes */}
            {order.notes && (
              <Box
                style={{
                  backgroundColor: '#fffbeb',
                  border: '0.5px solid #fde68a',
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
              >
                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                  📝 {order.notes}
                </Text>
              </Box>
            )}

          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

