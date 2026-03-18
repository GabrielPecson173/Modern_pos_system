import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { createOrder } from '../store/ordersSlice';
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
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDroplet, IconReceipt } from '@tabler/icons-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderFormValues {
  name: string;
  order_type: 'Walk-in' | 'Phone' | '';
  product: string;
  quantity: number | '';
  unit_price: number | '';
  total: number | '';
}

interface AddOrderModalProps {
  opened: boolean;
  onClose: () => void;
  /** Called with validated form data when user confirms */
  onSave?: (values: OrderFormValues) => void;
}

// ─── Product catalogue (frontend-only for now) ────────────────────────────────

const PRODUCTS = [
  { value: 'slim-bottle', label: 'Slim Bottle (500ml)', price: 15 },
  { value: 'round-bottle', label: 'Round Bottle (1L)', price: 25 },
  { value: '5gal-refill', label: '5-Gallon Refill', price: 35 },
  { value: '5gal-delivery', label: '5-Gallon w/ Delivery', price: 50 },
  { value: '10gal-refill', label: '10-Gallon Refill', price: 60 },
  { value: 'mineral-500', label: 'Mineral Water 500ml', label2: '', price: 20 },
];

const PRODUCT_OPTIONS = PRODUCTS.map((p) => ({
  value: p.value,
  label: p.label,
}));

// ─── Component ────────────────────────────────────────────────────────────────

export function AddOrderModal({ opened, onClose }: { opened: boolean; onClose: () => void; }) {
  const dispatch = useAppDispatch();
  const form = useForm<OrderFormValues>({
    initialValues: {
      name: '',
      order_type: '',
      product: '',
      quantity: '',
      unit_price: '',
      total: '',
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? 'Name must be at least 2 characters' : null),
      order_type: (v) => (!v ? 'Please select an order type' : null),
      product: (v) => (!v ? 'Please select a product' : null),
      quantity: (v) => (!v || Number(v) < 1 ? 'Enter a valid quantity' : null),
      unit_price: (v) => (!v || Number(v) <= 0 ? 'Enter a valid unit price' : null),
    },
  });

  // Auto-fill unit price when product changes
  useEffect(() => {
    if (!form.values.product) return;
    const match = PRODUCTS.find((p) => p.value === form.values.product);
    if (match) {
      form.setFieldValue('unit_price', match.price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.product]);

  // Auto-calculate total
  useEffect(() => {
    const qty = Number(form.values.quantity);
    const price = Number(form.values.unit_price);
    if (qty > 0 && price > 0) {
      form.setFieldValue('total', parseFloat((qty * price).toFixed(2)));
    } else {
      form.setFieldValue('total', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.quantity, form.values.unit_price]);

const handleSave = async () => {
  const result = form.validate();
  if (result.hasErrors) return;

  try {
    dispatch(createOrder({
      customer_name: form.values.name,
      order_type: form.values.order_type as 'Walk-in' | 'Phone',
      product: form.values.product,
      quantity: Number(form.values.quantity),
      unit_price: Number(form.values.unit_price),
    }));
    handleClose();
  } catch (error) {
    console.error('Failed to create order:', error);
  }
};

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const total = form.values.total;

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
              backgroundColor: 'var(--mantine-color-teal-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconDroplet size={16} color="white" />
          </Box>
          <Stack gap={0}>
            <Text fw={600} size="sm" lh={1.2}>New Order</Text>
            <Text size="10px" c="dimmed">Aqua Crystal POS</Text>
          </Stack>
        </Group>
      }
      size="md"
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      styles={{
        header: {
          paddingBottom: 12,
          borderBottom: '0.5px solid var(--mantine-color-gray-2)',
        },
        body: { padding: '20px 24px 24px' },
        title: { width: '100%' },
      }}
    >
      <Stack gap={14}>

        {/* Name */}
        <TextInput
          label="Customer Name"
          placeholder="e.g. Juan Dela Cruz"
          withAsterisk
          {...form.getInputProps('name')}
          styles={inputStyles}
        />

        {/* Order Type */}
        <Select
          label="Order Type"
          placeholder="Select type"
          withAsterisk
          data={[
            { value: 'Walk-in', label: 'Walk-in' },
            { value: 'Phone', label: 'Phone Order' },
          ]}
          {...form.getInputProps('order_type')}
          styles={inputStyles}
        />

        {/* Product */}
        <Select
          label="Product"
          placeholder="Search or select a product"
          withAsterisk
          searchable
          data={PRODUCT_OPTIONS}
          {...form.getInputProps('product')}
          styles={inputStyles}
        />

        <Divider labelPosition="center" label={<Text size="10px" c="dimmed">Pricing</Text>} />

        {/* Quantity & Unit Price side by side */}
        <Group grow gap={12}>
          <NumberInput
            label="Quantity"
            placeholder="0"
            withAsterisk
            min={1}
            step={1}
            hideControls={false}
            {...form.getInputProps('quantity')}
            styles={inputStyles}
          />
          <NumberInput
            label="Unit Price (₱)"
            placeholder="0.00"
            withAsterisk
            min={0}
            decimalScale={2}
            fixedDecimalScale
            {...form.getInputProps('unit_price')}
            styles={inputStyles}
          />
        </Group>

        {/* Total — read-only, auto-calculated */}
        <Box
          style={{
            backgroundColor: total !== '' ? 'var(--mantine-color-teal-0)' : 'var(--mantine-color-gray-0)',
            border: `0.5px solid ${total !== '' ? 'var(--mantine-color-teal-3)' : 'var(--mantine-color-gray-3)'}`,
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
          }}
        >
          <Stack gap={1}>
            <Text size="11px" c="dimmed" fw={500}>TOTAL</Text>
            <Text size="10px" c="dimmed">Quantity × Unit Price</Text>
          </Stack>
          <Group gap={8} align="center">
            <IconReceipt size={16} color={total !== '' ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-gray-5)'} />
            <Text
              fw={700}
              size={total !== '' ? 'xl' : 'sm'}
              c={total !== '' ? 'teal' : 'dimmed'}
              style={{ transition: 'all 0.2s', fontVariantNumeric: 'tabular-nums' }}
            >
              {total !== '' ? `₱${Number(total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}
            </Text>
          </Group>
        </Box>

        {/* Order type badge preview */}
        {form.values.order_type && (
          <Group gap={6}>
            <Text size="11px" c="dimmed">Order tagged as:</Text>
            <Badge
              size="sm"
              variant="light"
              color={form.values.order_type === 'Walk-in' ? 'teal' : 'blue'}
              radius="sm"
            >
              {form.values.order_type}
            </Badge>
          </Group>
        )}

        {/* Action buttons */}
        <Group justify="flex-end" gap={8} mt={4}>
          <Button
            variant="subtle"
            color="gray"
            radius="md"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            color="teal"
            radius="md"
            onClick={handleSave}
            leftSection={<IconReceipt size={15} />}
          >
            Confirm Order
          </Button>
        </Group>

      </Stack>
    </Modal>
  );
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputStyles = {
  label: {
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 4,
    color: 'var(--mantine-color-gray-7)',
  },
  input: {
    fontSize: 13,
    borderRadius: 8,
  },
};
