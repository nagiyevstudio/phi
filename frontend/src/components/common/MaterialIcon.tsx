type MaterialIconName =
  | 'add'
  | 'archive'
  | 'check'
  | 'close'
  | 'delete'
  | 'edit'
  | 'logout'
  | 'menu'
  | 'more-vert'
  | 'chevron-left'
  | 'chevron-right'
  | 'home'
  | 'list'
  | 'grid'
  | 'chart'
  | 'settings'
  | 'search'
  | 'wallet'
  | 'calendar'
  | 'income'
  | 'expense'
  | 'help'
  | 'email';

const ICON_NAME_MAP: Record<MaterialIconName, string> = {
  add: 'add',
  archive: 'archive',
  check: 'check',
  close: 'close',
  delete: 'delete',
  edit: 'edit',
  logout: 'logout',
  menu: 'menu',
  'more-vert': 'more_vert',
  'chevron-left': 'chevron_left',
  'chevron-right': 'chevron_right',
  home: 'home',
  list: 'list_alt',
  grid: 'grid_view',
  chart: 'bar_chart',
  settings: 'settings',
  search: 'search',
  wallet: 'account_balance_wallet',
  calendar: 'calendar_month',
  income: 'north',
  expense: 'south',
  help: 'help_outline',
  email: 'email',
};

interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
  variant?: 'filled' | 'outlined';
}

export default function MaterialIcon({ name, className, variant = 'filled' }: MaterialIconProps) {
  const iconName = ICON_NAME_MAP[name] || name;
  const sizeMatch = className?.match(/(?:^|\s)h-([0-9]+(?:\.[0-9]+)?)/);
  const size = sizeMatch ? Number.parseFloat(sizeMatch[1]) : null;
  const fontSize = size ? size * 4 : undefined;
  const variantClass = variant === 'filled' ? 'pf-icon-filled' : 'pf-icon-outlined';
  return (
    <span
      className={`material-symbols-outlined ${variantClass} ${className ?? ''}`}
      style={fontSize ? { fontSize } : undefined}
      aria-hidden="true"
    >
      {iconName}
    </span>
  );
}
