import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import { action } from '@storybook/addon-actions';
import { renders } from './index.stories';
import { MockedProvider } from '@apollo/react-testing';

jest.mock('@storybook/addon-actions');

describe('ArticleForm', () => {
  it('displays errors on submit', async () => {
    const { getByRole, getAllByText } = render(
      <MockedProvider>{renders()}</MockedProvider>
    );

    await wait(() => {
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      const errors = getAllByText(/is a required field$/);

      expect(errors).toHaveLength(3);
    });
  });

  it('calls onSubmit when valid on submit', async () => {
    const { getByRole, getByLabelText } = render(
      <MockedProvider>{renders()}</MockedProvider>
    );

    await wait(() => {
      fireEvent.change(getByLabelText(/title/i), {
        target: { value: 'How to build webapps that scale' }
      });
    });

    await wait(() => {
      fireEvent.change(getByLabelText(/description/i), {
        target: {
          value:
            'Web development technologies have evolved at an incredible clip over the past few years.'
        }
      });
    });

    await wait(() => {
      fireEvent.change(getByLabelText(/body/i), {
        target: {
          value:
            "## Introducing RealWorld.\nIt's a great solution for learning how other frameworks work."
        }
      });
    });

    await wait(() => {
      const submitButton = getByRole('button');

      fireEvent.click(submitButton);

      expect(action('onSubmit')).toHaveBeenCalled();
    });
  });
});