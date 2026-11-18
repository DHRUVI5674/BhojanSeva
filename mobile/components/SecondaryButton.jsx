import React from 'react';
import Button from './Button';

/**
 * SecondaryButton – convenience wrapper around the generic Button component
 * with the "secondary" variant pre‑selected.
 * Props are passed through to Button.
 */
export default function SecondaryButton(props) {
  return <Button {...props} variant="secondary" />;
}
