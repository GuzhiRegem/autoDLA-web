import { MantineProvider, createTheme, Title, Box, Tabs, Divider, Paper, Container, Table, Button, Flex, Group, Input, Blockquote, CloseButton } from '@mantine/core';
import { RenderedTable } from '../components/table-from-dict';
import { useState } from 'react';
import { ApiClient } from '../connectors/api';
import { IconReload } from '@tabler/icons-react';

const SectionTitle = (props) => {
  return (
    <Container fluid {...props}>
      <Group gap='0'>
        {
          (props.onReload) && <Button size="sm" radius="xl" px='xs' variant="light" onClick={props.onReload}><IconReload /></Button>
        }
        <Container fluid>
          <Title order={4}>{props.children}</Title>
        </Container>
        {
          (props.onClose) && <CloseButton onClick={props.onClose}/>
        }
      </Group>
    </Container>
  )
}

function ObjectDashboard(props) {
  const defaultObj = {}
  Object.keys(props.schema.properties).map((k) => defaultObj[k] = '---')
  const [data, setData] = useState([defaultObj])
  const [selectedData, setSelectedData] = useState(undefined);
  const client = ApiClient(props.obj)

  const updateData = async () => {
    const res = await client.get_all()
    if (res.length > 0) {
      setData(res)
    } else {
      setData([defaultObj])
    }
  }
  const selectRow = async (inpData) => {
    setSelectedData(inpData);
  }

  return (
    <Container fluid>
      <Group grow gap='xs' align="start">
        <Box>
          <Title order={3} mt={'md'}>{props.obj}</Title>
          <Box>
            <Divider mt='lg'/>
            <SectionTitle mt='lg' onReload={updateData}>{props.obj} list</SectionTitle>
            <RenderedTable data={data} onRowSelect={selectRow}/>
          </Box>
        </Box>
        {
          (selectedData) && (
            <Group grow>
              <Divider orientation="vertical" h='auto' maw='sm'/>
              <Container mt='md' fluid>
                <SectionTitle onClose={() => setSelectedData(undefined)}>{props.obj} details</SectionTitle>
                <Container fluid mb='lg'>
                  {
                    Object.keys(selectedData).map((k) => <Box>
                      <Title order={5} mt='md'>{k}</Title>
                      <Paper shadow='xs' withBorder px='sm' py='xs'>{selectedData[k]}</Paper>
                    </Box>)
                  }
                </Container>
                <SectionTitle onReload={() => setSelectedData(undefined)} mt='xl'>History</SectionTitle>
              </Container>
            </Group>
          )
        }
      </Group>
    </Container>
  )
}

function ObjectsPage(props) {
  const schema = props.schema;

  return (
    <Tabs orientation="vertical" ml={'lg'}>
      <Tabs.List>
        {
          Object.keys(schema).map((k) => 
            <Tabs.Tab value={k} key={crypto.randomUUID()}>{k}</Tabs.Tab>
          )
        }
      </Tabs.List>
      {
        Object.keys(schema).map((k) => 
          <Tabs.Panel value={k} key={crypto.randomUUID()}>
            <ObjectDashboard obj={k} schema={schema[k]}/>
          </Tabs.Panel>
        )
      }
    </Tabs>
  )
}

export default ObjectsPage;