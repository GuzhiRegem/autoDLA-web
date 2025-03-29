import { useState, useEffect, useRef } from 'react'
import './App.css'
import { MantineProvider, createTheme, Title, Box, Tabs, Divider, Paper, Container, Table } from '@mantine/core';
import {InfiniteCanvas, CanvasBox, CanvasLine} from './components/infinite-canvas';
import { RenderedTable } from './components/table-from-dict';

const theme = createTheme({
  primaryColor: 'autodla-blue',
  primaryShade: 5,
  colors: {
    'autodla-blue': ['#E0E6EB', '#C2CED9', '#A3B6C8', '#859EB6', '#6686A5', '#4F9DDE', '#3E6B87', '#2F556C', '#1F3E51', '#1E2A38'],
    'audit-green': ['#D3F7EA', '#A8F0D5', '#7DE9C0', '#52E2AB', '#3ECF8E', '#2BB975', '#1DA55F', '#118F4A', '#097A38', '#036529'],
    'warning-coral': ['#FFE5E5', '#FFC9C9', '#FFAFAF', '#FF9595', '#FF7B7B', '#FF6B6B', '#E55D5D', '#CC5050', '#B34343', '#993737'],
    'neutral-gray': ['#F9FAFB', '#F5F7FA', '#E4E7EB', '#D1D6DB', '#B0B8C1', '#8B95A1', '#6B7785', '#4C5561', '#333B46', '#1E1E1E'],
  },
});

function SchemaPage() {
  return (
    <InfiniteCanvas>
      <CanvasBox>Adios</CanvasBox>
      <CanvasLine x1={50} y1={50} x2={300} y2={0} />
      <CanvasBox x={200}>
        <RenderedTable data={[{"field": "name", "type": "str"}]}/>
      </CanvasBox>
    </InfiniteCanvas>
  )
}

function ObjectDashboard(props) {
  return (
    <Container>
      <Title order={3} mt={'md'}>{props.obj}</Title>
    </Container>
  )
}

function ObjectsPage() {
  const [schema, setSchema] = useState({'user': 2, 'group' : 2})

  return (
    <Tabs orientation="vertical" ml={'lg'}>
      <Tabs.List>
        {
          Object.keys(schema).map((k) => 
            <Tabs.Tab value={k}>{k}</Tabs.Tab>
          )
        }
      </Tabs.List>
      {
        Object.keys(schema).map((k) => 
          <Tabs.Panel value={k}>
            <ObjectDashboard obj={k} />
          </Tabs.Panel>
        )
      }
    </Tabs>
  )
}

function App() {
  return (
    <MantineProvider theme={theme}>
      <Box p='lg'>
        <Title color='primary' fw='normal'><strong>AUTODLA</strong> - WEB</Title>
      </Box>
      <Divider/>
      <Tabs defaultValue="schema" orientation="vertical">
        <Tabs.List>
          <Tabs.Tab value="schema">Schema</Tabs.Tab>
          <Tabs.Tab value="objects">Objects</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="schema">
          <SchemaPage />
        </Tabs.Panel>
        <Tabs.Panel value="objects">
          <ObjectsPage />
        </Tabs.Panel>
      </Tabs>
    </MantineProvider>
  )
}

export default App
