import { render } from '@testing-library/react';
import AddJobPage from '../add-job/page';

describe('AddJobPage', () => {
    it('renders without crashing', () => {
        render(<AddJobPage />);
    });
});