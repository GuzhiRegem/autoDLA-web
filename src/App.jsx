import { useState, useEffect, useRef } from 'react'
import './App.css'
import { MantineProvider, createTheme, Title, Box, Tabs, Divider, Paper, Container, Table } from '@mantine/core';
import { ApiClient, get_json_schema } from './connectors/api';
const UserClient = ApiClient('User');
import ObjectsPage from './pages/ObjectsPage'
import SchemaPage from './pages/SchemaPage'


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

function App() {
  const [schema, setSchema] = useState({})
  const updateFunc = async () => {
    const res = await get_json_schema();
    setSchema(res)
  }
  useEffect(() => {
    updateFunc();
  }, []);
  return (
    <MantineProvider theme={theme}>
      <Box p='lg'>
        <Title color='primary' fw='normal'><strong>AUTODLA</strong> - WEB</Title>
      </Box>
      <Divider/>
      <Tabs defaultValue="schema" orientation="vertical" style={{height: '100%'}}>
        <Tabs.List>
          <Tabs.Tab value="schema">Schema</Tabs.Tab>
          <Tabs.Tab value="objects">Objects</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="schema">
          <SchemaPage schema={schema}/>
        </Tabs.Panel>
        <Tabs.Panel value="objects">
          <ObjectsPage schema={schema}/>
        </Tabs.Panel>
      </Tabs>
    </MantineProvider>
  )
}

export default App
