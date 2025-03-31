import { MantineProvider, createTheme, Title, Box, Tabs, Divider, Paper, Container, Table } from '@mantine/core';
import { InfiniteCanvas, CanvasBox, CanvasLine } from '../components/infinite-canvas';
import { RenderedTable } from '../components/table-from-dict';

const cleanRef = (st) => st['$ref'].slice(8)

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
    Object.keys(schema[key].properties).map((def_key) => {
      const def_val = schema[key].properties[def_key];
      const proc_val = {
        field_name: def_val.title || def_key,
        field_type: def_val.type || '',
        refears_to: undefined
      }
      if (def_val['$ref']) {
        proc_val.field_type = cleanRef(def_val)
        proc_val.refears_to = cleanRef(def_val)
      }
      if (def_val['items']) {
        proc_val.field_type = `${proc_val.field_type}[${cleanRef(def_val['items'])}]`
        proc_val.refears_to = cleanRef(def_val['items'])
      }
      if (proc_val.refears_to) {
        const ref_obj = objects[proc_val.refears_to]
        if (ref_obj){
          idx--;
          obj.position = {
            x: ref_obj.position.x - 200,
            y: ref_obj.position.y - 300
          }
        }
      }
      obj.table_data.push({
        "Field": proc_val.field_name,
        "Type": proc_val.field_type
      })
    })
    objects[key] = obj
    idx++;
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