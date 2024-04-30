import type { Story, StoryDefault } from '@ladle/react';
import { Button, type ButtonProps } from '../button';

export default {
  title: 'Components',
} satisfies StoryDefault;

export const Showcase: Story<ButtonProps> = () => {
  return (
    <div>
      <Button>Ok</Button>
    </div>
  );
};

Showcase.storyName = 'Button';

Showcase.args = {
  disabled: false,
};

Showcase.argTypes = {
  onClick: {
    action: 'clicked',
  },
};
