import { MantineProvider, createTheme, Title, Box, Tabs, Divider, Paper, Container, Table, Badge, Text } from '@mantine/core';
import { InfiniteCanvas, CanvasBox, CanvasLine } from '../components/infinite-canvas';
import { RenderedTable } from '../components/table-from-dict';
import { useEffect, useState, useRef } from 'react';

const cleanRef = (st) => st['$ref'].slice(8)

function Reference(props) {
  const [position, setPosition] = useState(undefined)
  const ref = useRef(0);

  useEffect(() => {
    if (ref.current) {
      let c = ref.current;
      const localRect = c.getBoundingClientRect();
      while (true) {
        if (c.parentElement.parentElement.tagName.toLowerCase() == 'foreignobject') {
          break;
        }
        if (c.parentElement) {
          c = c.parentElement
        }
      }
      const globalRect = c.getBoundingClientRect();
      setPosition({
        x: localRect.left - globalRect.left + localRect.width,
        y: localRect.top - globalRect.top + (localRect.height/2)
      })
    }
  }, [ref])

  return (
    <>
      <Text ref={ref}>{props.children}</Text>
      {
        (position) && <CanvasLine x1={position.x} y1={position.y} x2={props.x} y2={props.y}/>
      }
    </>
  )
}

function SchemaPage(props) {
  const schema = props.schema;
  let objects = {}
  let objects_list = []
  let idx = 0
  Object.keys(schema).map((key) => {
    const obj = {
      position: {
        x: idx * 300, y: 0
      },
      table_data: []
    }
    Object.keys(schema[key]).map((def_key) => {
      const def_val = schema[key][def_key];
      const proc_val = {
        field_name: def_key,
        field_type: def_val.type,
        refears_to: (def_val.depends) ? def_val.depends.slice('$ref:'.length) : undefined
      }
      if (proc_val.refears_to) {
        const ref_obj = objects[proc_val.refears_to]
        if (ref_obj){
          idx--;
          obj.position = {
            x: ref_obj.position.x - 400,
            y: ref_obj.position.y - 300
          }
        }
        proc_val.field_type = {refears_to_name: proc_val.field_type, refears_to_pos: ref_obj.position}
      }
      obj.table_data.push({
        "Field": proc_val.field_name,
        "Type": proc_val.field_type
      })
    })
    objects[key] = obj
    idx++;
    console.log(obj)
  })
  let min = {
    x: 0,
    y: 0
  }
  Object.values(objects).map((v) => {
    if (v.position.y < min.y) {
      min.y = v.position.y
    }
    if (v.position.x < min.x) {
      min.x = v.position.x
    }
  })
  Object.keys(objects).map((k) => {
    const v = objects[k]
    v.position = {
      x: v.position.x - min.x,
      y: v.position.y - min.y
    }
    v.table_data.map((d) => {
      if (d["Type"].refears_to_name) {
        const pos = d["Type"].refears_to_pos
        const new_pos = {
          x: pos.x - min.x,
          y: pos.y - min.y
        }
        d["Type"] = <Reference x={new_pos.x + 20} y={new_pos.y + 20}>{d["Type"].refears_to_name}</Reference>
      }
    })
    objects[k] = v
  })
  Object.keys(objects).map((key) => {
    const val = objects[key]
    objects_list.push(
      <CanvasBox x={val.position.x} y={val.position.y}>
        <Title>{key}</Title>
        <RenderedTable data={val.table_data} />
      </CanvasBox>
    )
    console.log(val)
  })
  return (
    <InfiniteCanvas>
      {objects_list}
    </InfiniteCanvas>
  )
}

export default SchemaPage