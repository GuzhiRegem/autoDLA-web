import { Group, Modal, Title, Input, Container, Button, PasswordInput, TextInput } from '@mantine/core';
import { useState } from 'react';
import { auth, cookies } from '../connectors/api'

const LoginForm = (props) => {
    const [data, setData] = useState({
        username: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    let sending = false
    const sendData = () => {
        const a_f = async (val) => {
            if (sending) { return }
            sending = true
            setLoading(true)
            try {
                const res = await auth(val.username, val.password)
                cookies.set('token', res.access_token)
                props.onSuccess()
                setError(false)
            } catch (e) {
                if (e) {
                    setError(true)
                    console.error(e)
                }
            }
            sending = false
            setLoading(false)
        }
        const f = (val) => {
            a_f(val)
            return val
        }
        setData(f);
    }
    return (
        <Modal opened centered withCloseButton={false} onClose={() => {}}>
            <Group justify='center'>
                <Title color='primary' fw='normal'><strong>AUTODLA</strong> - WEB</Title>
            </Group>
            <Container fluid mt='lg'>
                <TextInput
                    label="Username"
                    onChange={(ele) => setData((dat) => {return {...dat, username: ele.target.value}})}
                    mt='lg'
                    error={error}
                />
                <PasswordInput
                    label="Password"
                    onChange={(ele) => setData((dat) => {return {...dat, password: ele.target.value}})}
                    mt='sm'
                    error={error}
                />
                <Button fullWidth onClick={() => sendData()} my='30' loading={loading}>Login</Button>
            </Container>
        </Modal>
    )
}

export { LoginForm }