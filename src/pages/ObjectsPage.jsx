import { MantineProvider, createTheme, Title, Box, Tabs, Divider, Paper, Container, Table, Button, Flex, Group, Input, Blockquote, CloseButton, Text, List } from '@mantine/core';
import { RenderedTable } from '../components/table-from-dict';
import { useEffect, useState } from 'react';
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


const CustomContainer = (props) => {
  return (
    <Container fluid style={{width: '100%', overflowX:'hidden', display: 'flex'}} miw='40vw' p='0' {...props}>
        <Divider orientation="vertical" h='auto' maw='sm' mr='sm'/>
        <Container fluid style={{width: '100%', overflowX:'auto'}}>
          {props.children}
        </Container>
    </Container>
  )
}

const FlexContainer = (props) => {
  const [elementsList, setElementsList] = useState([])
  const initialSetup = () => {
    const lis = []
    props.elementsList.map((ele) => {
      const elementId = crypto.randomUUID()
      const newElement = <ele.ele key={elementId} {...ele.props} addChildFunc={(eleId, elementIdParam = undefined) => addChild(eleId, elementIdParam)} removeChildFunc={(passedKey) => (passedKey) ? removeChild(passedKey) : removeChild(elementId)}></ele.ele>
      lis.push(newElement);
    })
    setElementsList(lis);
  }
  const addChild = (ele, elementIdParam = undefined) => {
    const func = (prevList) => {
      const lis = prevList.slice();
      let elementId = elementIdParam;
      if (!elementId) {
        elementId = crypto.randomUUID()
      }
      const newElement = <ele.ele key={elementId} {...ele.props} addChildFunc={(eleId) => addChild(eleId)} removeChildFunc={() => removeChild(elementId)}></ele.ele>
      lis.push(newElement);
      return (lis);
    }
    setElementsList(func);
  }
  const removeChild = (eleId) => {
    const func = (prevList) => {
      const lis = prevList.slice();
      const filter_lis = lis.filter((val) => val.key == eleId)
      if (filter_lis.length <= 0) {
        return (lis);
      }
      const index = lis.indexOf(filter_lis[0]);
      if (index > -1) {
        lis.splice(index, 1);
      }
      return (lis);
    }
    setElementsList(func);
  }
  useEffect(() => {
    initialSetup()
  }, [])

  return (
    <Flex gap='0' mb='lg'>
      {elementsList.map((ele) => <CustomContainer>{ele}</CustomContainer>)}
    </Flex>
  )
}

const ObjectDetails = (props) => {
  const [selectedNode, setSelectedNode] = useState(undefined);
  const changeKey = (key) => {
    const func = (prev_key) => {
      if (prev_key) {
        props.removeChildFunc(prev_key)
      }
      return (key)
    }
    setSelectedNode(func);
  }
  const [dataObj, setData] = useState(undefined)
  const primary_key_field = Object.keys(props.schema[props.obj]).filter((k) => props.schema[props.obj][k].type == 'primary_key')[0]
  const client = ApiClient(props.obj);
  const updateData = async () => {
    const obj_id = props.data[primary_key_field];
    if (obj_id != '---') {
      const res = await client.get_by_id(props.data[primary_key_field])
      setData(res);
    }
  }

  const openNode = (objType, objData) => {
    const key = crypto.randomUUID()
    props.addChildFunc({ele: ObjectDetails, props: {obj: objType, data: objData, schema: props.schema}}, key);
    changeKey(key)
  }
  
  useEffect(() => {
    updateData()
  }, [])
  const processData = (data, k) => {
    const obj = data[k]
    const isList = props.schema[props.obj][k].type.slice(0, 4) === 'list'
    let depends = undefined
    if (props.schema[props.obj][k].depends) {
      depends = props.schema[props.obj][k].depends.slice(5)
    }
    const itemTransform = (v) => {
      if (depends) {
        return <Paper withBorder p='sm' onClick={() => openNode(depends, obj)}>
          <Text>{depends}</Text>
          <List>
            {
              Object.keys(v).map((v_k) => <List.Item>{v_k}: {JSON.stringify(v[v_k])}</List.Item>)
            }
          </List>
        </Paper>
      }
      return JSON.stringify(v)
    }
    if (isList) {
      return <List>{obj.map((v) => <List.Item>{itemTransform(v)}</List.Item>)}</List>
    }
    return(itemTransform(obj))
  }
  return (
    <Container fluid px='0'>
      <SectionTitle onClose={props.removeChildFunc} mt='lg' onReload={updateData}>{props.obj} details</SectionTitle>
      {
        (dataObj) && <Container fluid>
          {
            Object.keys(dataObj).map((k) => <Box mt='md'>
              <Text>{k}</Text>
              <Paper shadow='xs' withBorder>{processData(dataObj, k)}</Paper>
            </Box>)
          }
        </Container>
      }
    </Container>
  )
}

const TableElement = (props) => {
  const [selectedNode, setSelectedNode] = useState(undefined);
  const changeKey = (key) => {
    const func = (prev_key) => {
      if (prev_key) {
        props.removeChildFunc(prev_key)
      }
      return (key)
    }
    setSelectedNode(func);
  }
  const openNode = (objData) => {
    const key = crypto.randomUUID()
    props.addChildFunc({ele: ObjectDetails, props: {obj: props.obj, data: objData, schema: props.schema}}, key);
    changeKey(key)
  }
  const defaultObj = {}
  Object.keys(props.schema[props.obj]).map((k) => defaultObj[k] = '---')
  const [data, setData] = useState([defaultObj])
  const client = ApiClient(props.obj)
  const updateData = async () => {
    const res = await client.get_all()
    const out = []
    res.map((obj) => {
      const res_obj = {}
      Object.keys(obj).map((key) => {
        if ((props.schema[props.obj][key].type.slice(0, 'list'.length) == 'list') || props.schema[props.obj][key].depends) {
          res_obj[key] = <strong>{props.schema[props.obj][key].type}</strong>
          return
        }
        res_obj[key] = obj[key]
      })
      out.push(res_obj)
    })
    setData(out)
  }
  return (
    <Container fluid px='0'>
      <Title>{props.obj}</Title>
      <SectionTitle onReload={updateData}>{props.obj} Table</SectionTitle>
      <RenderedTable data={data} onRowSelect={openNode}/>
    </Container>
  )
}

function ObjectDashboard(props) {
  return (
    <Container fluid>
      <FlexContainer elementsList={[{ele: TableElement, props: {obj: props.obj, schema: props.schema}}]}/>
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
          <Tabs.Panel value={k} key={crypto.randomUUID()} style={{ maxWidth: '90vw', overflow: 'scroll'}}>
            <ObjectDashboard obj={k} schema={schema}/>
          </Tabs.Panel>
        )
      }
    </Tabs>
  )
}

export default ObjectsPage;