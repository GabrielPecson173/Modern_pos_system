import React from 'react';
import { Button, Tooltip, type ButtonProps } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface AddButtonProps extends ButtonProps {
  /** Optional tooltip */
  tooltip?: string;
}

export function AddButton({ 
  tooltip, 
  className = 'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50', 
  children = <IconPlus size={20} />, 
  ...props 
}: AddButtonProps) {
  return (
    <Tooltip label={tooltip || 'Add new item'} position="top" withArrow>
      <Button
        {...props}
        className={className}
        size="lg"
        variant="filled"
        color="blue"
        radius="xl"
        leftSection={children}
        styles={(theme) => ({
          root: {
            height: 48,
            width: 48,
            minWidth: 48,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        })}
      />
    </Tooltip>
  );
}

