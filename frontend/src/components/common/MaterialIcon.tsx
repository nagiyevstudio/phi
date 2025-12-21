type MaterialIconName =
  | 'add'
  | 'archive'
  | 'check'
  | 'close'
  | 'delete'
  | 'edit'
  | 'logout'
  | 'menu'
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
  | 'expense';

const ICON_PATHS: Record<MaterialIconName, string> = {
  add: 'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z',
  archive:
    'M20.54 5.23L19.15 3.5H4.85L3.46 5.23C3.17 5.6 3 6.06 3 6.5V8c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V6.5c0-.44-.17-.9-.46-1.27zM5.12 5l.81-1h12.14l.81 1H5.12zM19 9H5v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V9zm-4 6h-6v-2h6v2z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z',
  delete:
    'M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  logout:
    'M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5v-2h5V5h-5V3zm-2.5 4.5l1.42 1.42L10.34 11H15v2h-4.66l2.58 2.58-1.42 1.42L7 12l4.5-4.5z',
  menu:
    'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z',
  'chevron-left': 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  'chevron-right': 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  list:
    'M4 6h2v2H4V6zm4 0h12v2H8V6zM4 11h2v2H4v-2zm4 0h12v2H8v-2zM4 16h2v2H4v-2zm4 0h12v2H8v-2z',
  grid: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z',
  chart: 'M5 9h3v10H5V9zm6-4h3v14h-3V5zm6 7h3v7h-3v-7z',
  settings:
    'M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54a7.03 7.03 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64L4.86 9.7c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.38 1.05.7 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54c.58-.24 1.13-.56 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.14 12.94zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z',
  search:
    'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z',
  wallet:
    'M21 7.28V5c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v2.28c0 .35.18.67.46.86l1.04.69c.3.2.5.54.5.9V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9.73c0-.36.2-.7.5-.9l1.04-.69c.28-.19.46-.51.46-.86zM19 19H5V9h14v10zM19 7H5V5h14v2zM15 13h-4v2h4v-2z',
  calendar:
    'M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z',
  income:
    'M4 12l1.41-1.41L11 16.17V4h2v12.17l5.59-5.58L20 12l-8 8-8-8z',
  expense:
    'M4 12l8-8 8 8-1.41 1.41L13 7.83V20h-2V7.83l-5.59 5.58L4 12z',
};

interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
}

export default function MaterialIcon({ name, className }: MaterialIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name]} fill="currentColor" />
    </svg>
  );
}
