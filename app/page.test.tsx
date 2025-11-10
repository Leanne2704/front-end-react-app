import { render } from '@testing-library/react';
import Page from '../page';

describe('Page', () => {
    it('renders without crashing', () => {
        render(<Page />);
    });
});