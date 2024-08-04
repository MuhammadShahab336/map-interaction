import React from 'react';
import {StoryFn, Meta } from '@storybook/react';
import PolygonEditor from '../components/PolygonEditor';

export default {
    title: 'Map/PolygonEditor',
    component: PolygonEditor,
} as Meta;

const Template: StoryFn = (args) => <PolygonEditor {...args} />;

export const Default = Template.bind({});