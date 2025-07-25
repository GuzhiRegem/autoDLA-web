import { MantineProvider, createTheme, Title, Box, Tabs, Divider, Paper, Container, Table, Button, Flex, Group, Input, Blockquote, CloseButton, Text, List, Modal } from '@mantine/core';
import { RenderedTable } from '../components/table-from-dict';
import { useEffect, useState } from 'react';
import { ApiClient } from '../connectors/api';
import { IconReload, IconTrash, IconEdit } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

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

const ObjectSelect = (props) => {
  const defaultObj = {}
  Object.keys(props.schema[props.obj]).map((k) => defaultObj[k] = '---')
  const [data, setData] = useState([defaultObj])
  const [page, setPage] = useState(0);
  const client = ApiClient(props.obj)
  const updateData = async (pageArg = 0) => {
    const res = await client.get_all(10, pageArg*10)
    let out = []
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
    if (out.length === 0) {
      out = [defaultObj]
    }
    setData(out)
  }
  const selectObject = (obj) => {
    if (obj != undefined) {
      props.onSelect(obj)
    }
    props.removeChildFunc();
  }
  useEffect(() => {
    useEffect(() => {
      if (!isNaN(page)) {
        updateData(page);
      } else {
        setPage(0)
      }
    }, [page])
  }, [])
  return (
    <Container fluid px='0'>
      <SectionTitle onReload={() => updateData(page)} onClose={() => selectObject()} mt='lg'>Select {props.obj}</SectionTitle>
      <RenderedTable data={data} onRowSelect={selectObject}/>
      <Group>
        <Button onClick={() => setPage(page - 1)}>
          {'<'}
        </Button>
        <Text>{page}</Text>
        <Button onClick={() => setPage(page + 1)}>
          {'>'}
        </Button>
      </Group>
    </Container>
  )
}
const ObjectEdit = (props) => {
  const schema = props.schema[props.obj];
  const primary_key_field = Object.keys(schema).filter((k) => schema[k].type == 'primary_key')[0]
  let defaultObj = {}
  Object.keys(schema).filter((k) => schema[k].nullable).map((k) => defaultObj[k] = null)
  defaultObj = { ...defaultObj, ...props.data }
  const [selectedNode, setSelectedNode] = useState({});
  const [error, setError] = useState({})
  const [currentData, setCurrentData] = useState(defaultObj)
  const [loading, setLoading] = useState(false)
  const changeKey = (key) => {
    const func = (prev_key) => {
      if (prev_key) {
        props.removeChildFunc(prev_key)
      }
      return (key)
    }
    setSelectedNode(func);
  }
  const changeValue = (key, value, func_i) => {
    const func = (prev_dict) => {
      return ({...prev_dict, [key]: value(prev_dict[key])})
    }
    func_i(func);
  }
  const client = ApiClient(props.obj);
  let sending = false
  const sendData = () => {
    const a_f = async (val) => {
      if (sending) {
        return
      }
      sending = true
      await setLoading(true);
      try {
        const new_val = {}
        Object.keys(val).map((k) => {
          const s = schema[k]
          if (['int', 'float'].includes(s.type)) {
            new_val[k] = JSON.parse(val[k])
          } else {
            if (s.is_list) {
              try {
                new_val[k] = JSON.parse(val[k])
              } catch (e1) {
                new_val[k] = val[k]
              }
            } else {
              new_val[k] = val[k]
            }
          }
        })
        console.log(new_val)
        await client.edit(props.data[primary_key_field], new_val);
        props.onUpdate();
        props.removeChildFunc();
      } catch (e) {
        if (e.data) {
          if (e.data.detail) {
            setError({})
            e.data.detail.map((e_k) => {
              changeValue(e_k.loc[1], x => e_k.msg, setError)
            })
          } else {
            console.log(e)
          }
        } else {
          console.log(e)
        }
      } finally {
        sending = false
        setLoading(false);
      }
    }
    const f = (val) => {
      a_f(val);
      return val
    }
    setCurrentData(f)
  }

  const openNode = (objType, onRowSelect) => {
    const key = crypto.randomUUID()
    props.addChildFunc({ele: ObjectSelect, props: {obj: objType, schema: props.schema, onSelect: onRowSelect}}, key);
    changeKey(key)
  }

  return (
    <Container fluid px='0'>
      <SectionTitle onClose={() => props.removeChildFunc()} mt='lg'>Edit {props.obj}</SectionTitle>
      <Container fluid>
        {
          Object.keys(schema).map((k) => <Box mt='md'>
            <Input.Wrapper
              label={<Group><Text fw='bold'>{k}</Text><Text c='yellow'>{'< '}{(schema[k].is_list) ? `list[${schema[k].type}]` : schema[k].type}{' >'}</Text>{(schema[k].nullable) && <Text c='red'>{'< nullable >'}</Text>}</Group>}
              error={error[k]}
            >
              {
                (schema[k].primary_key) ? (
                  <Input placeholder={'auto generated'} disabled={true} value={props.data[primary_key_field]}/>
                ):
                (schema[k].depends) ? (
                  (schema[k].is_list) ? (
                    <Paper withBorder p='sm' style={(error[k]) ? {borderColor: 'red'} : {}}
                      onClick={() => openNode(schema[k].depends.slice(5), (val) => changeValue(k, (x) => [...(x || []), val], setCurrentData))}
                    >
                      {(currentData[k]) ? (
                      <List spacing="sm">{currentData[k].map((x) =>
                        <List.Item>
                          <Paper withBorder p='sm'>
                            <Group>
                              <List listStyleType="disc">
                                {
                                  Object.keys(x).map((v_k) => <List.Item><strong>{v_k}</strong>: {JSON.stringify(x[v_k])}</List.Item>)
                                }
                              </List>
                              <CloseButton/>
                            </Group>
                          </Paper>
                        </List.Item>)}
                      </List>) : <div/>}
                    </Paper>
                  ):
                    <Paper withBorder p='sm' style={(error[k]) ? {borderColor: 'red'} : {}}
                      onClick={() => openNode(schema[k].depends.slice(5), (val) => changeValue(k, (x) => val, setCurrentData))}
                    >
                      {(currentData[k]) ? (
                        <Paper withBorder p='sm'>
                          <List listStyleType="disc">
                            {
                              Object.keys(currentData[k]).map((v_k) => <List.Item><strong>{v_k}</strong>: {JSON.stringify(currentData[k][v_k])}</List.Item>)
                            }
                          </List>
                        </Paper>
                      ) : <div/>}
                    </Paper>
                ):
                <Input placeholder={k} onChange={(event) => changeValue(k, (x) => event.target.value, setCurrentData)} error={error[k]} value={currentData[k]}/>
              }
            </Input.Wrapper>
          </Box>)
        }
        <Button fullWidth mt='lg' onClick={() => {if (!loading) {sendData();}}} disabled={loading}>Update</Button>
      </Container>
    </Container>
  )
}
const ObjectCreate = (props) => {
  const schema = props.schema[props.obj];
  const primary_key_field = Object.keys(schema).filter((k) => schema[k].type == 'primary_key')[0]
  const defaultObj = {
    [primary_key_field]: 'id'
  }
  Object.keys(schema).filter((k) => schema[k].nullable).map((k) => defaultObj[k] = null)
  const [selectedNode, setSelectedNode] = useState({});
  const [error, setError] = useState({})
  const [currentData, setCurrentData] = useState(defaultObj)
  const [loading, setLoading] = useState(false)
  const changeKey = (key) => {
    const func = (prev_key) => {
      if (prev_key) {
        props.removeChildFunc(prev_key)
      }
      return (key)
    }
    setSelectedNode(func);
  }
  const changeValue = (key, value, func_i) => {
    const func = (prev_dict) => {
      return ({...prev_dict, [key]: value(prev_dict[key])})
    }
    func_i(func);
  }
  const client = ApiClient(props.obj);
  let sending = false
  const sendData = () => {
    const a_f = async (val) => {
      if (sending) {
        return
      }
      sending = true
      await setLoading(true);
      try {
        const new_val = {}
        Object.keys(val).map((k) => {
          const s = schema[k]
          if (['int', 'float'].includes(s.type)) {
            new_val[k] = JSON.parse(val[k])
          } else {
            if (s.is_list) {
              try {
                new_val[k] = JSON.parse(val[k])
              } catch (e1) {
                new_val[k] = val[k]
              }
            } else {
              new_val[k] = val[k]
            }
          }
        })
        await client.create(new_val);
        props.onUpdate();
        props.removeChildFunc();
      } catch (e) {
        if (e.data) {
          if (e.data.detail) {
            setError({})
            e.data.detail.map((e_k) => {
              changeValue(e_k.loc[1], x => e_k.msg, setError)
            })
          } else {
            console.log(e)
          }
        } else {
          console.log(e)
        }
      } finally {
        sending = false
        setLoading(false);
      }
    }
    const f = (val) => {
      a_f(val);
      return val
    }
    setCurrentData(f)
  }

  const openNode = (objType, onRowSelect) => {
    const key = crypto.randomUUID()
    props.addChildFunc({ele: ObjectSelect, props: {obj: objType, schema: props.schema, onSelect: onRowSelect}}, key);
    changeKey(key)
  }

  return (
    <Container fluid px='0'>
      <SectionTitle onClose={() => props.removeChildFunc()} mt='lg'>Create {props.obj}</SectionTitle>
      <Container fluid>
        {
          Object.keys(schema).map((k) => <Box mt='md'>
            <Input.Wrapper
              label={<Group><Text fw='bold'>{k}</Text><Text c='yellow'>{'< '}{(schema[k].is_list) ? `list[${schema[k].type}]` : schema[k].type}{' >'}</Text>{(schema[k].nullable) && <Text c='red'>{'< nullable >'}</Text>}</Group>}
              error={error[k]}
            >
              {
                (schema[k].primary_key) ? (
                  <Input placeholder={'auto generated'} disabled={true}/>
                ):
                (schema[k].depends) ? (
                  (schema[k].is_list) ? (
                    <Paper withBorder p='sm' style={(error[k]) ? {borderColor: 'red'} : {}}
                      onClick={() => openNode(schema[k].depends.slice(5), (val) => changeValue(k, (x) => [...(x || []), val], setCurrentData))}
                    >
                      {(currentData[k]) ? (
                      <List spacing="sm">{currentData[k].map((x) =>
                        <List.Item>
                          <Paper withBorder p='sm'>
                            <Group>
                              <List listStyleType="disc">
                                {
                                  Object.keys(x).map((v_k) => <List.Item><strong>{v_k}</strong>: {JSON.stringify(x[v_k])}</List.Item>)
                                }
                              </List>
                              <CloseButton/>
                            </Group>
                          </Paper>
                        </List.Item>)}
                      </List>) : <div/>}
                    </Paper>
                  ):
                    <Paper withBorder p='sm' style={(error[k]) ? {borderColor: 'red'} : {}}
                      onClick={() => openNode(schema[k].depends.slice(5), (val) => changeValue(k, (x) => val, setCurrentData))}
                    >
                      {(currentData[k]) ? (
                        <Paper withBorder p='sm'>
                          <List listStyleType="disc">
                            {
                              Object.keys(currentData[k]).map((v_k) => <List.Item><strong>{v_k}</strong>: {JSON.stringify(currentData[k][v_k])}</List.Item>)
                            }
                          </List>
                        </Paper>
                      ) : <div/>}
                    </Paper>
                ):
                <Input placeholder={k} onChange={(event) => changeValue(k, (x) => event.target.value, setCurrentData)} error={error[k]}/>
              }
            </Input.Wrapper>
          </Box>)
        }
        <Button fullWidth mt='lg' onClick={() => {if (!loading) {sendData();}}} disabled={loading}>Create</Button>
      </Container>
    </Container>
  )
}

const ObjectDetails = (props) => {
  const [selectedNode, setSelectedNode] = useState(undefined);
  const [deleteModalOpened, deleteModalHandler] = useDisclosure(false);
  const changeKey = (key) => {
    const func = (prev_key) => {
      if (prev_key) {
        props.removeChildFunc(prev_key)
      }
      return (key)
    }
    setSelectedNode(func);
  }
  const [dataObj, setData] = useState(undefined);
  const [history, setHistory] = useState(undefined);
  const primary_key_field = Object.keys(props.schema[props.obj]).filter((k) => props.schema[props.obj][k].type == 'primary_key')[0]
  const client = ApiClient(props.obj);
  const updateData = async () => {
    const obj_id = props.data[primary_key_field];
    if (!['---', undefined].includes(obj_id)) {
      const res = await client.get_by_id(props.data[primary_key_field])
      if (res === undefined) {
        props.removeChildFunc()
      }
      if (props.onUpdate) {
        props.onUpdate()
      }
      setData(res);
    }
  }
  const updateHistory = async () => {
    const obj_id = props.data[primary_key_field];
    if (!['---', undefined].includes(obj_id)) {
      const res = await client.get_history(props.data[primary_key_field])
      if (res != undefined) {
        console.log(res)
        setHistory(res);
      }
    }
  }

  const deleteObject = () => {
    const call_f = async (id_param) => {
      await client.delete(id_param)
      props.removeChildFunc()
      if (props.onUpdate) {
        props.onUpdate()
      }
    }
    const f = (data) => {
      call_f(data[primary_key_field])
      return (f)
    }
    setData(f)
  }

  const openNode = (objType, objData, objectEle) => {
    const key = crypto.randomUUID()
    props.addChildFunc({ele: objectEle, props: {obj: objType, data: objData, schema: props.schema, onUpdate: updateData}}, key);
    changeKey(key)
  }
  
  useEffect(() => {
    updateData()
  }, [])

  useEffect(() => {
    console.log(deleteModalOpened)
  }, [deleteModalOpened])

  const processData = (data, k) => {
    const obj = data[k]
    if ([null, undefined].includes(obj)) {
      return '----'
    }
    const isList = props.schema[props.obj][k].is_list === true
    let depends = undefined
    if (props.schema[props.obj][k].depends) {
      depends = props.schema[props.obj][k].depends.slice(5)
    }
    const itemTransform = (v) => {
      if (depends) {
        return <Paper withBorder p='sm' onClick={() => openNode(depends, v, ObjectDetails)}>
          <List listStyleType="disc">
            {
              Object.keys(v).map((v_k) => <List.Item><strong>{v_k}</strong>: {JSON.stringify(v[v_k])}</List.Item>)
            }
          </List>
        </Paper>
      }
      return JSON.stringify(v)
    }
    if (isList) {
      if (obj.length == 0) {
        return '----'
      }
      return <List spacing="sm" listStyleType="disc">{obj.map((v) => <List.Item>{itemTransform(v)}</List.Item>)}</List>
    }
    return(itemTransform(obj))
  }

  return (
    <Container fluid px='0'>
      <SectionTitle onClose={() => props.removeChildFunc()} mt='lg' onReload={updateData}>{props.obj} details</SectionTitle>
      {
        (dataObj) && <>
          <Container fluid>
            <Group my='lg' justify="flex-end">
              <Button onClick={() => openNode(props.obj, dataObj, ObjectEdit)}><IconEdit /></Button>
              <Button color='red' onClick={deleteModalHandler.open}><IconTrash /></Button>
            </Group>
          </Container>
          <Container fluid>
            {
              Object.keys(dataObj).map((k) => <Box mt='md'>
                <Group>
                  <Text fw='bold'>{k}</Text>
                  <Text c='yellow'>{'< '}{(props.schema[props.obj][k].is_list) ? `list[${props.schema[props.obj][k].type}]` : props.schema[props.obj][k].type}{' >'}</Text>
                  {(props.schema[props.obj][k].nullable) && <Text c='red'>{'< nullable >'}</Text>}
                </Group>
                <Paper shadow='xs' withBorder p='sm' bg='neutral-gray.1'>{processData(dataObj, k)}</Paper>
              </Box>)
            }
          </Container>
          <Modal opened={deleteModalOpened} onClose={deleteModalHandler.close} title='Warning' centered>
            <Text>You are about to delete:</Text>
            <Text>{`${props.obj} <${dataObj[primary_key_field]}>`}</Text>
            <Text mt='lg'>Are you sure you want to continue?</Text>
            <Group mt='lg' justify='flex-end'>
              <Button bg='red' onClick={deleteObject}><IconTrash /> Yes</Button>
              <Button bg='neutral-gray.1' c='black' onClick={deleteModalHandler.close}>No</Button>
            </Group>
          </Modal>
        </> 
      }
      <SectionTitle mt='lg' onReload={updateHistory}>History</SectionTitle>
      {
        (history) ? <>
          <RenderedTable data={history.self}/>
          {
            (history.dependencies) && Object.keys(history.dependencies).map((h_k) => <>
              <Text mt='lg'>{h_k}</Text>
              <RenderedTable data={history.dependencies[h_k]}/>
            </>)
          }
        </> : <Text mt='lg' align='center'>...</Text>
      }
    </Container>
  )
}

const TableElement = (props) => {
  const [selectedNode, setSelectedNode] = useState(undefined);
  const [page, setPage] = useState(0);
  const changeKey = (key) => {
    const func = (prev_key) => {
      if (prev_key) {
        props.removeChildFunc(prev_key)
      }
      return (key)
    }
    setSelectedNode(func);
  }
  const openNode = (objData, eleParam) => {
    const key = crypto.randomUUID()
    props.addChildFunc({ele: eleParam, props: {obj: props.obj, data: objData, schema: props.schema, onUpdate: updateData}}, key);
    changeKey(key)
  }
  const defaultObj = {}
  Object.keys(props.schema[props.obj]).map((k) => defaultObj[k] = '---')
  const [data, setData] = useState([defaultObj])
  const client = ApiClient(props.obj)
  const updateData = async (toPage = 0) => {
    const res = await client.get_all(10, toPage * 10)
    let out = []
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
    if (out.length === 0) {
      out = [defaultObj]
    }
    setData(out)
  }
  useEffect(() => {
    if (!isNaN(page)) {
      updateData(page);
    } else {
      setPage(0)
    }
  }, [page])
  return (
    <Container fluid px='0'>
      <Group my='lg'>
        <Title>{props.obj}</Title>
        <Button onClick={() => openNode(undefined, ObjectCreate)} ml='auto'>New</Button>
      </Group>
      <SectionTitle onReload={() => updateData(page)}>Objects</SectionTitle>
      <RenderedTable data={data} onRowSelect={(objData) => openNode(objData, ObjectDetails)}/>
      <Group>
        <Button onClick={() => setPage(page - 1)}>
          {'<'}
        </Button>
        <Text>{page}</Text>
        <Button onClick={() => setPage(page + 1)}>
          {'>'}
        </Button>
      </Group>
    </Container>
  )
}



//////////////////////////////////////// General Configs



const CustomContainer = (props) => {
  return (
    <Container fluid style={{width: '100%', overflowX:'hidden', display: 'flex', overflowY: 'auto', height: '100%'}} miw='40vw' p='0' {...props}>
        <Divider orientation="vertical" h='auto' maw='sm' mr='sm'/>
        <Container fluid style={{width: '100%', overflowX:'auto'}} pb='100'>
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
      const newElement = <ele.ele key={elementId} {...ele.props} addChildFunc={(eleId, elementIdParam = undefined) => addChild(eleId, elementIdParam)} removeChildFunc={(passedKey) => (passedKey) ? removeChild(passedKey) : removeChild(elementId)}></ele.ele>
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
    <Flex gap='0' style={{height: '100%'}}>
      {elementsList.map((ele) => <CustomContainer>{ele}</CustomContainer>)}
    </Flex>
  )
}

function ObjectDashboard(props) {
  return (
    <Container fluid style={{height: '100%'}}>
      <FlexContainer elementsList={[{ele: TableElement, props: {obj: props.obj, schema: props.schema}}]}/>
    </Container>
  )
}

function ObjectsPage(props) {
  const schema = props.schema;

  return (
    <Tabs orientation="vertical" ml={'lg'} style={{height: '100%'}}>
      <Tabs.List>
        {
          Object.keys(schema).map((k) => 
            <Tabs.Tab value={k} key={crypto.randomUUID()}>{k}</Tabs.Tab>
          )
        }
      </Tabs.List>
      {
        Object.keys(schema).map((k) => 
          <Tabs.Panel value={k} key={crypto.randomUUID()} style={{ maxWidth: '90vw', overflow: 'scroll', height: '100%'}} p='0' pb='lg'>
            <ObjectDashboard obj={k} schema={schema}/>
          </Tabs.Panel>
        )
      }
    </Tabs>
  )
}

export default ObjectsPage;