import { useLocation } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { AddOrderModal } from './AddOrderModal';
import { AddLaundryModal } from './laundry/AddLaundryModal';

export function SmartAddButton() {
  const location = useLocation();
  const isLaundry = location.pathname === '/laundry';
  const [waterOpened, waterHandlers] = useDisclosure(false);
  const [laundryOpened, laundryHandlers] = useDisclosure(false);

  const openWater = waterHandlers.open;
  const openLaundry = laundryHandlers.open;
  const closeWater = waterHandlers.close;
  const closeLaundry = laundryHandlers.close;

  const onClick = () => {
    if (isLaundry) {
      openLaundry();
    } else {
      openWater();
    }
  };

  return (
    <>
      <ActionIcon
        size={28}
        radius="xl"
        color="teal"
        variant="filled"
        onClick={onClick}
        aria-label={isLaundry ? 'New Laundry Order' : 'New Water Order'}
        style={{ position: 'absolute', top: 12, left: 12, zIndex: 100 }}
      >
        <IconPlus size={16} />
      </ActionIcon>
      <AddOrderModal opened={waterOpened} onClose={closeWater} />
      <AddLaundryModal opened={laundryOpened} onClose={closeLaundry} />
    </>
  );
}

