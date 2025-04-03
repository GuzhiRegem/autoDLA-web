import { Table } from "@mantine/core"

function RenderedTable(props) {
    const dataProcess = (data) => {
        if ([true, false].includes(data)) {
            return {true: 'TRUE', false: 'FALSE'}[data]
        }
        return (data)
    }
    const data = props.data
    if (data.length == 0) {
        return (<div/>)
    }
    const headers = Object.keys(data[0])
    const head_render = <Table.Tr>{headers.map((hdr) => <Table.Th key={crypto.randomUUID()}>{hdr}</Table.Th>)}</Table.Tr>;
    const data_render = data.map((row) => <Table.Tr key={crypto.randomUUID()} onClick={() => props.onRowSelect(row)}>{Object.keys(row).map(field => <Table.Td key={crypto.randomUUID()}>{dataProcess(row[field])}</Table.Td>)}</Table.Tr>);
    return (
        <Table highlightOnHover withColumnBorders mt='sm'>
            <Table.Thead bg='neutral-gray.4'>
                {head_render}
            </Table.Thead>
            <Table.Tbody>
                {data_render}
            </Table.Tbody>
        </Table>
    )
}

export {RenderedTable}