import React from 'react';
import { render } from '@testing-library/react';
import Select from './Select';

describe('Select component', () => {
	it('renders without crashing', () => {
		render(<Select />);
	});
});