import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Container, Title, Text, Group, TextInput, Select,
  Center, Loader, Tooltip, Avatar, Box, Popover, Button, Badge,
} from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { DatePicker } from '@mantine/dates';
import { DataTable } from 'mantine-datatable';
import {
  IconChevronRight, IconSearch, IconX, IconCalendar,
  IconClipboardList, IconArrowRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditLogRow = {
  id:          number;
  timestamp:   string;
  user_email:  string;
  user_name:   string;
  user_role:   string;
  action:      string;
  entity_type: string;
  entity_id:   string | number;
  description: string;
  before:      Record<string, string> | null;
  after:       Record<string, string> | null;
  status:      'success' | 'failed';
  branch:      string;
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; color: string; bg: string }> = {
  login:           { label: 'LOGIN',    color: '#6639ba', bg: '#f3eeff' },
  logout:          { label: 'LOGOUT',   color: '#555',    bg: '#f0f0f0' },
  create_order:    { label: 'CREATE',   color: '#1a7f37', bg: '#dafbe1' },
  update_order:    { label: 'UPDATE',   color: '#0969da', bg: '#ddf4ff' },
  delete_order:    { label: 'DELETE',   color: '#cf222e', bg: '#ffebe9' },
  mark_paid:       { label: 'PAID',     color: '#1a7f37', bg: '#dafbe1' },
  create_laundry:  { label: 'CREATE',   color: '#1a7f37', bg: '#dafbe1' },
  update_laundry:  { label: 'UPDATE',   color: '#0969da', bg: '#ddf4ff' },
  delete_laundry:  { label: 'DELETE',   color: '#cf222e', bg: '#ffebe9' },
  create_user:     { label: 'CREATE',   color: '#1a7f37', bg: '#dafbe1' },
  update_user:     { label: 'UPDATE',   color: '#0969da', bg: '#ddf4ff' },
  delete_user:     { label: 'DELETE',   color: '#cf222e', bg: '#ffebe9' },
};

const ACTION_FILTER_OPTIONS = [
  { group: 'Auth',    items: [{ value: 'login', label: 'Login' }, { value: 'logout', label: 'Logout' }] },
  { group: 'Water',   items: [{ value: 'create_order', label: 'Create Order' }, { value: 'update_order', label: 'Update Order' }, { value: 'delete_order', label: 'Delete Order' }, { value: 'mark_paid', label: 'Mark Paid' }] },
  { group: 'Laundry', items: [{ value: 'create_laundry', label: 'Create Laundry' }, { value: 'update_laundry', label: 'Update Laundry' }, { value: 'delete_laundry', label: 'Delete Laundry' }] },
  { group: 'Users',   items: [{ value: 'create_user', label: 'Create User' }, { value: 'update_user', label: 'Update User' }, { value: 'delete_user', label: 'Delete User' }] },
];

const ROLE_COLOR: Record<string, string> = {
  admin:            'violet',
  water_employee:   'teal',
  laundry_employee: 'blue',
};

const PAGE_SIZE = 25;
const DATE_PRESETS = [
  { label: 'Today',        days: 0  },
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 30 days', days: 30 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB',  { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US',  { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

function getInitials(name: string | undefined) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Before / After diff popover ─────────────────────────────────────────────

function BeforeAfter({ before, after }: { before: Record<string, string> | null; after: Record<string, string> | null }) {
  if (!before && !after) return null;
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));

  return (
    <Popover width={320} position="left" shadow="md" withArrow>
      <Popover.Target>
        <Button size="compact-xs" variant="subtle" color="gray" style={{ fontSize: 11, flexShrink: 0 }}>
          diff
        </Button>
      </Popover.Target>
      <Popover.Dropdown p="sm">
        <Text size="xs" fw={700} mb={8} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Changes</Text>
        {keys.map((k) => {
          const b = before?.[k];
          const a = after?.[k];
          const changed = b !== a;
          return (
            <Box key={k} mb={6}>
              <Text size="xs" c="dimmed" tt="capitalize" mb={2}>{k.replace(/_/g, ' ')}</Text>
              {b && a && changed ? (
                <Group gap={4} wrap="nowrap">
                  <Text size="xs" c="red" ff="monospace" style={{ textDecoration: 'line-through' }}>{b}</Text>
                  <IconArrowRight size={10} color="#94a3b8" />
                  <Text size="xs" c="green" ff="monospace" fw={600}>{a}</Text>
                </Group>
              ) : (
                <Text size="xs" ff="monospace" c="dark">{a ?? b ?? '—'}</Text>
              )}
            </Box>
          );
        })}
      </Popover.Dropdown>
    </Popover>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AuditLogsPage() {
  const navigate = useNavigate();

  const [logs,         setLogs]         = useState<AuditLogRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterUser,   setFilterUser]   = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterBranch, setFilterBranch] = useState<string | null>(null);
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(PAGE_SIZE);
  const [dateRange,    setDateRange]    = useState<[Date | null, Date | null]>([null, null]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const triggerRef  = useRef<HTMLDivElement>(null);
  const dropdownRef = useClickOutside(
    () => setCalendarOpen(false),
    ['mousedown', 'touchstart'],
    [triggerRef],
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/audit-logs/', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, filterAction, filterUser, filterStatus, filterBranch, dateRange]);

  const userOptions = useMemo(() => {
    const seen = new Map<string, string>();
    logs.forEach((l) => { if (l.user_email) seen.set(l.user_email, l.user_name || l.user_email); });
    return Array.from(seen.entries()).sort().map(([v, label]) => ({ value: v, label }));
  }, [logs]);

  const branchOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((l) => l.branch).filter(Boolean)));
    return unique.sort().map((b) => ({ value: b, label: b }));
  }, [logs]);

  function applyPreset(days: number, label: string) {
    const end = new Date(); const start = new Date();
    if (days === 0) { start.setHours(0,0,0,0); end.setHours(23,59,59,999); }
    else { start.setDate(start.getDate() - days); start.setHours(0,0,0,0); }
    setDateRange([start, end]); setActivePreset(label); setCalendarOpen(false); setPage(1);
  }

  function clearDateFilter() { setDateRange([null, null]); setActivePreset(null); setPage(1); }

  const dateLabel = (() => {
    if (activePreset) return activePreset;
    const [start, end] = dateRange;
    if (!start) return null;
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!end || start.toDateString() === end.toDateString()) return fmt(start);
    return `${fmt(start)} — ${fmt(end)}`;
  })();

  const filtered = useMemo(() => logs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch =
      (log.user_name   ?? '').toLowerCase().includes(q) ||
      (log.user_email  ?? '').toLowerCase().includes(q) ||
      (log.description ?? '').toLowerCase().includes(q) ||
      (log.action      ?? '').toLowerCase().includes(q) ||
      (log.entity_type ?? '').toLowerCase().includes(q) ||
      String(log.entity_id ?? '').toLowerCase().includes(q);
    const matchAction  = !filterAction || log.action     === filterAction;
    const matchUser    = !filterUser   || log.user_email === filterUser;
    const matchStatus  = !filterStatus || log.status     === filterStatus;
    const matchBranch  = !filterBranch || log.branch     === filterBranch;
    const [s, e]       = dateRange;
    const matchDate    = (!s || !e) ? true : (() => { const t = new Date(log.timestamp); return t >= new Date(s) && t <= new Date(e); })();
    return matchSearch && matchAction && matchUser && matchStatus && matchBranch && matchDate;
  }), [logs, search, filterAction, filterUser, filterStatus, filterBranch, dateRange]);

  const from  = (page - 1) * pageSize;
  const paged = filtered.slice(from, from + pageSize);
  const hasFilters = !!(filterAction || filterUser || filterStatus || filterBranch || dateLabel || search);

  if (loading) return <Center h="100vh"><Loader color="teal" /></Center>;

  return (
    <Container size="xl" py="sm">

      {/* Breadcrumb */}
      <Group mb="xs" gap={6}>
        <Text fw={700} c="teal" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Aqua Crystal</Text>
        <IconChevronRight size={14} color="#94a3b8" />
        <Text fw={500} c="dimmed" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</Text>
        <IconChevronRight size={14} color="#94a3b8" />
        <Text fw={600} c="#424242">Audit Logs</Text>
      </Group>

      <Group justify="space-between" align="flex-end" mb="sm">
        <Box>
          <Title order={2}>Audit Logs</Title>
          <Text size="xs" c="dimmed" mt={2}>
            {filtered.length.toLocaleString()} {filtered.length === 1 ? 'entry' : 'entries'}
            {hasFilters ? ' matching filters' : ' total'}
          </Text>
        </Box>
        {hasFilters && (
          <Button size="xs" variant="subtle" color="gray" leftSection={<IconX size={12} />}
            onClick={() => { setSearch(''); setFilterAction(null); setFilterUser(null); setFilterStatus(null); setFilterBranch(null); clearDateFilter(); }}>
            Clear all filters
          </Button>
        )}
      </Group>

      {/* Toolbar */}
      <Group justify="space-between" mb="sm" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap">
          <Select placeholder="Action type" clearable value={filterAction} onChange={setFilterAction} data={ACTION_FILTER_OPTIONS} w={170} size="sm" />
          <Select placeholder="Filter by user" clearable searchable value={filterUser} onChange={setFilterUser} data={userOptions} w={200} size="sm" />
          <Select placeholder="Status" clearable value={filterStatus} onChange={setFilterStatus}
            data={[{ value: 'success', label: '✓ Success' }, { value: 'failed', label: '✗ Failed' }]} w={140} size="sm" />
          {branchOptions.length > 1 && (
            <Select placeholder="Branch" clearable value={filterBranch} onChange={setFilterBranch} data={branchOptions} w={160} size="sm" />
          )}

          {/* Date range popover */}
          <Popover opened={calendarOpen} position="bottom-start" shadow="md" withinPortal>
            <Popover.Target>
              <div ref={triggerRef}>
                <Button
                  variant={dateLabel ? 'light' : 'default'} color={dateLabel ? 'teal' : 'gray'} size="sm"
                  leftSection={<IconCalendar size={15} />}
                  rightSection={dateLabel ? <IconX size={13} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); clearDateFilter(); }} /> : null}
                  onClick={() => setCalendarOpen((o) => !o)}
                  styles={{ root: { fontWeight: dateLabel ? 600 : 400 } }}
                >
                  {dateLabel ?? 'Date range'}
                </Button>
              </div>
            </Popover.Target>
            <Popover.Dropdown ref={dropdownRef} p="sm" style={{ width: 338 }}>
              <Group gap={8} mb={12}>
                {DATE_PRESETS.map((p) => (
                  <Button key={p.label} size="xs" variant={activePreset === p.label ? 'filled' : 'default'} color="teal" onClick={() => applyPreset(p.days, p.label)}>
                    {p.label}
                  </Button>
                ))}
              </Group>
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <DatePicker type="range" value={dateRange} maxDate={new Date()}
                  onChange={(val) => {
                    const [start, end] = val as [Date | null, Date | null];
                    if (start && end) {
                      const s = new Date(start); s.setHours(0,0,0,0);
                      const e = new Date(end);   e.setHours(23,59,59,999);
                      setDateRange([s, e]); setActivePreset(null); setCalendarOpen(false); setPage(1); return;
                    }
                    setDateRange([start, null]); setActivePreset(null);
                  }}
                  styles={{ month: { width: '100%' }, calendarHeader: { width: '100%' }, monthCell: { padding: 1 }, day: { flex: 1 } }}
                />
              </Box>
              {dateRange[0] && !dateRange[1] && (
                <Box mt="xs">
                  <Button fullWidth size="xs" variant="light" color="teal" onClick={() => {
                    const s = new Date(dateRange[0]!); s.setHours(0,0,0,0);
                    const e = new Date(dateRange[0]!); e.setHours(23,59,59,999);
                    setDateRange([s, e]); setActivePreset(null); setCalendarOpen(false); setPage(1);
                  }}>Apply — show only this day</Button>
                </Box>
              )}
              {dateLabel && (
                <Box mt="xs">
                  <Button fullWidth size="xs" variant="subtle" color="gray" leftSection={<IconX size={13} />} onClick={clearDateFilter}>
                    Clear date filter
                  </Button>
                </Box>
              )}
            </Popover.Dropdown>
          </Popover>
        </Group>

        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Search name, description, order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          rightSection={search ? <IconX size={14} style={{ cursor: 'pointer' }} onClick={() => setSearch('')} /> : null}
          w={300} size="sm"
        />
      </Group>

      {/* Table */}
      <DataTable
        withTableBorder borderRadius="md" highlightOnHover
        fetching={loading}
        records={paged}
        idAccessor="id"
        totalRecords={filtered.length}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={[10, 25, 50]}
        onRecordsPerPageChange={(size) => { setPageSize(size); setPage(1); }}
        paginationText={({ totalRecords }) => `${totalRecords} entries`}
        paginationActiveBackgroundColor="#038F8D"
        emptyState={
          <Center py="xl">
            <Box style={{ textAlign: 'center' }}>
              <IconClipboardList size={36} color="#cbd5e1" style={{ marginBottom: 8 }} />
              <Text c="dimmed" size="sm">{hasFilters ? 'No logs match your filters.' : 'No audit logs yet.'}</Text>
            </Box>
          </Center>
        }
        columns={[
          {
            accessor: 'id', title: '#', width: 55,
            render: (log: AuditLogRow) => <Text size="sm" c="dimmed" ff="monospace">#{log.id}</Text>,
          },
          {
            accessor: 'user_name', title: 'User', width: 190,
            render: (log: AuditLogRow) => (
              <Group gap={8} wrap="nowrap">
                <Avatar radius="xl" size={32} color={ROLE_COLOR[log.user_role] ?? 'gray'}>
                  {getInitials(log.user_name)}
                </Avatar>
                <Box>
                  <Text size="sm" fw={600} lineClamp={1}>{log.user_name || log.user_email || '—'}</Text>
                  <Text size="xs" c="dimmed" style={{ textTransform: 'capitalize' }}>
                    {log.user_role?.replace(/_/g, ' ') ?? ''}
                  </Text>
                </Box>
              </Group>
            ),
          },
          {
            accessor: 'action', title: 'Action', width: 100,
            render: (log: AuditLogRow) => {
              const meta = ACTION_META[log.action] ?? { label: log.action.toUpperCase(), color: '#555', bg: '#f0f0f0' };
              return (
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: meta.color, backgroundColor: meta.bg }}>
                  {meta.label}
                </span>
              );
            },
          },
          {
            accessor: 'description', title: 'What happened',
            render: (log: AuditLogRow) => (
              <Group gap={6} wrap="nowrap">
                <Tooltip label={log.description} withArrow multiline w={360} disabled={(log.description?.length ?? 0) <= 65}>
                  <Text size="sm" lineClamp={2} style={{ maxWidth: 400 }}>{log.description || '—'}</Text>
                </Tooltip>
                <BeforeAfter before={log.before} after={log.after} />
              </Group>
            ),
          },
          {
            accessor: 'status', title: 'Status', width: 90,
            render: (log: AuditLogRow) => (
              <Badge size="sm" radius="sm" color={log.status === 'success' ? 'green' : 'red'} variant="light">
                {log.status === 'success' ? 'Success' : 'Failed'}
              </Badge>
            ),
          },
          {
            accessor: 'timestamp', title: 'When', width: 130,
            render: (log: AuditLogRow) => {
              const { date, time } = formatTimestamp(log.timestamp);
              return <Box><Text size="sm">{date}</Text><Text size="xs" c="dimmed">{time}</Text></Box>;
            },
          },
        ]}
      />
    </Container>
  );
}
