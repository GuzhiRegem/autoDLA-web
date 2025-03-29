import { Table } from "@mantine/core"

function RenderedTable(props) {
    const data = props.data
    const headers = Object.keys(data[0])
    const head_render = <Table.Tr>{headers.map((hdr) => <Table.Th>{hdr}</Table.Th>)}</Table.Tr>;
    const data_render = data.map((row) => <Table.Tr>{Object.keys(row).map(field => <Table.Td>{row[field]}</Table.Td>)}</Table.Tr>);
    return (
        <Table>
            <Table.Thead>
                {head_render}
            </Table.Thead>
            <Table.Tbody>
                {data_render}
            </Table.Tbody>
        </Table>
    )
}

export {RenderedTable}