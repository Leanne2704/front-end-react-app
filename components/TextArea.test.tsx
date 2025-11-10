import React from 'react';
import { render } from '@testing-library/react';
import TextArea from './TextArea';

describe('TextArea component', () => {
    it('renders without crashing', () => {
        render(<TextArea />);
    });
});