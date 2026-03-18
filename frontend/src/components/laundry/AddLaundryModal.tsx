import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Button,
  Group,
  Stack,
  Text,
  Box,
  Divider,
  ActionIcon,
  Flex,
  SegmentedControl,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash, IconWashMachine } from '@tabler/icons-react';
import { LaundryOrder, PickupDay, PaymentMethod } from './laundry.types';

const PICKUP_DAYS: PickupDay[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const LAUNDRY_TYPES = [
  { value: 'White',       label: 'White',           price: 25 },
  { value: 'Colored',     label: 'Colored',          price: 22 },
  { value: 'Assorted',    label: 'Assorted',         price: 18 },
  { value: 'Bedsheets',   label: 'Bedsheets',        price: 30 },
  { value: 'Jeans/Thick', label: 'Jeans / Thick',    price: 40 },
  { value: 'Delicates',   label: 'Delicates',        price: 45 },
];

interface ItemRow {
  label: string;
  weight: number | '';
  price_per_kg: number | '';
}

interface FormValues {
  customer_name: string;
  pickup_day: PickupDay | '';
  payment_method: PaymentMethod;
  notes: string;
  items: ItemRow[];
}

interface AddLaundryModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (order: Omit<LaundryOrder, 'id' | 'created_at'>) => void;
}

export function AddLaundryModal({ opened, onClose, onSave }: AddLaundryModalProps) {
  const form = useForm<FormValues>({
    initialValues: {
      customer_name: '',
      pickup_day: '',
      payment_method: 'Cash',
      notes: '',
      items: [{ label: '', weight: '', price_per_kg: '' }],
    },
    validate: {
      customer_name: (v) => v.trim().length < 2 ? 'Enter a valid name' : null,
      pickup_day: (v) => !v ? 'Select a pickup day' : null,
      items: {
        label:       (v) => !v ? 'Select a type' : null,
        weight:      (v) => (!v || Number(v) <= 0) ? 'Enter weight' : null,
        price_per_kg:(v) => (!v || Number(v) <= 0) ? 'Enter price' : null,
      },
    },
  });

  // Auto-fill price when label changes
  const watchItems = form.values.items;
  useEffect(() => {
    watchItems.forEach((item, idx) => {
      const match = LAUNDRY_TYPES.find((t) => t.value === item.label);
      if (match && item.price_per_kg !== match.price) {
        form.setFieldValue(`items.${idx}.price_per_kg`, match.price);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchItems.map((i) => i.label).join(',')]);

  const computedTotal = form.values.items.reduce((sum, item) => {
    const w = Number(item.weight) || 0;
    const p = Number(item.price_per_kg) || 0;
    return sum + w * p;
  }, 0);

  const addItem = () =>
    form.insertListItem('items', { label: '', weight: '', price_per_kg: '' });

  const removeItem = (idx: number) => form.removeListItem('items', idx);

  const handleSave = () => {
    const result = form.validate();
    if (result.hasErrors) return;

    const { customer_name, pickup_day, payment_method, notes, items } = form.values;
    const order: Omit<LaundryOrder, 'id' | 'created_at'> = {
      customer_name,
      pickup_day: pickup_day as PickupDay,
      payment_method,
      payment_status: 'Unpaid',
      notes: notes || undefined,
      total_php: parseFloat(computedTotal.toFixed(2)),
      items: items.map((item, i) => ({
        id: `new-item-${i}`,
        label: item.label,
        weight: Number(item.weight),
        price_per_kg: Number(item.price_per_kg),
      })),
    };

    console.log('🧺 [Aqua Crystal] New Laundry Order:', order);
    onSave(order);
    form.reset();
    onClose();
  };

  const handleClose = () => { form.reset(); onClose(); };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap={8}>
          <Box
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconWashMachine size={16} color="white" />
          </Box>
          <Stack gap={0}>
            <Text fw={600} size="sm" lh={1.2}>New Laundry Order</Text>
            <Text size="10px" c="dimmed">Aqua Crystal POS</Text>
          </Stack>
        </Group>
      }
      size="md"
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      styles={{
        header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-gray-2)' },
        body: { padding: '20px 24px 24px' },
      }}
    >
      <Stack gap={14}>

        <TextInput
          label="Customer Name"
          placeholder="e.g. Juan Dela Cruz"
          withAsterisk
          {...form.getInputProps('customer_name')}
          styles={inputStyles}
        />

        <Select
          label="Pickup Day"
          placeholder="Select day"
          withAsterisk
          data={PICKUP_DAYS.map((d) => ({ value: d, label: d }))}
          {...form.getInputProps('pickup_day')}
          styles={inputStyles}
        />

        <Divider
          labelPosition="left"
          label={
            <Text size="10px" fw={700} c="dimmed" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Items
            </Text>
          }
        />

        {/* Dynamic item rows */}
        <Stack gap={8}>
          {form.values.items.map((_, idx) => (
            <Box
              key={idx}
              style={{
                backgroundColor: '#f8fafc',
                border: '0.5px solid #e2e8f0',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              <Flex align="flex-start" gap={8}>
                <Box style={{ flex: 2 }}>
                  <Select
                    size="xs"
                    placeholder="Type"
                    searchable
                    data={LAUNDRY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    {...form.getInputProps(`items.${idx}.label`)}
                    styles={inputStyles}
                  />
                </Box>
                <Box style={{ flex: 1 }}>
                  <NumberInput
                    size="xs"
                    placeholder="kg"
                    min={0}
                    decimalScale={1}
                    hideControls
                    rightSection={<Text size="10px" c="dimmed">kg</Text>}
                    {...form.getInputProps(`items.${idx}.weight`)}
                    styles={inputStyles}
                  />
                </Box>
                <Box style={{ flex: 1 }}>
                  <NumberInput
                    size="xs"
                    placeholder="₱/kg"
                    min={0}
                    hideControls
                    leftSection={<Text size="10px" c="dimmed">₱</Text>}
                    {...form.getInputProps(`items.${idx}.price_per_kg`)}
                    styles={inputStyles}
                  />
                </Box>
                {form.values.items.length > 1 && (
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    mt={1}
                    onClick={() => removeItem(idx)}
                  >
                    <IconTrash size={13} />
                  </ActionIcon>
                )}
              </Flex>

              {/* Row subtotal */}
              {Number(form.values.items[idx].weight) > 0 && Number(form.values.items[idx].price_per_kg) > 0 && (
                <Text size="10px" c="dimmed" mt={4} style={{ textAlign: 'right' }}>
                  Subtotal: ₱{(Number(form.values.items[idx].weight) * Number(form.values.items[idx].price_per_kg)).toFixed(2)}
                </Text>
              )}
            </Box>
          ))}

          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconPlus size={12} />}
            onClick={addItem}
            style={{ border: '0.5px dashed #cbd5e1', borderRadius: 8 }}
          >
            Add item
          </Button>
        </Stack>

        {/* Total */}
        <Box
          style={{
            backgroundColor: computedTotal > 0 ? '#eff6ff' : '#f8fafc',
            border: `0.5px solid ${computedTotal > 0 ? '#bfdbfe' : '#e2e8f0'}`,
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
        >
          <Text size="xs" fw={600} c="dimmed">Total</Text>
          <Text
            fw={800}
            size={computedTotal > 0 ? 'lg' : 'sm'}
            style={{ color: computedTotal > 0 ? '#2563eb' : '#94a3b8', fontVariantNumeric: 'tabular-nums', transition: 'all 0.2s' }}
          >
            {computedTotal > 0 ? `₱${computedTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}
          </Text>
        </Box>

        {/* Payment method */}
        <Stack gap={6}>
          <Text size="11px" fw={600} c="dimmed" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Payment Method
          </Text>
          <SegmentedControl
            value={form.values.payment_method}
            onChange={(v) => form.setFieldValue('payment_method', v as PaymentMethod)}
            data={[
              { label: '💵  Cash', value: 'Cash' },
              { label: '📱  GCash', value: 'GCash' },
            ]}
            size="xs"
            radius="xl"
            fullWidth
            styles={{
              root: { backgroundColor: '#f1f5f9', border: '0.5px solid #e2e8f0' },
              indicator: {
                backgroundColor: form.values.payment_method === 'GCash' ? '#3b82f6' : '#10b981',
                borderRadius: 99,
              },
              label: { fontWeight: 600, fontSize: 12 },
            }}
          />
        </Stack>

        <TextInput
          label="Notes (optional)"
          placeholder="e.g. Fragile fabric, use cold water"
          {...form.getInputProps('notes')}
          styles={inputStyles}
        />

        <Group justify="flex-end" gap={8} mt={4}>
          <Button variant="subtle" color="gray" radius="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="blue" radius="md" onClick={handleSave} leftSection={<IconWashMachine size={15} />}>
            Save Order
          </Button>
        </Group>

      </Stack>
    </Modal>
  );
}

const inputStyles = {
  label: { fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--mantine-color-gray-7)' },
  input: { fontSize: 13, borderRadius: 8 },
};
