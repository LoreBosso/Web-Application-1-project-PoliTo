import { useState } from "react";
import { Form, Button, Spinner, Row, Col, Card} from "react-bootstrap";
import { Link } from "react-router";

function LoginPage(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        props.setLoading(true);
        try {
            await props.handleLogin({ username, password });     
        } 
        catch (err) {
            console.error("Errore nel login: ", err);
        }
        finally{
            props.setLoading(false);
        }
    };

    return (
        <>
            <Row className="justify-content-center align-items-center my-5">
                <Col xs="auto">
                    <Card border="white" style={{ width: '30rem' }} >
                        <Card.Body>
                            <Card.Title className="mb-4 text-center">Accedi</Card.Title>
                            {props.loading && <div className="text-center"><Spinner animation="border" variant="primary" /></div>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="username" className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        name="username"
                                        value={username}
                                        onChange={user => setUsername(user.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="password" className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={pass => setPassword(pass.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </Form.Group>
                                <Row className="d-flex justify-content-center">
                                    <Col>
                                        <Button type='submit' variant="success" className="my-2" disabled={props.loading}>Login</Button>
                                    </Col>
                                    <Col>
                                        <Link className="btn btn-outline-danger my-2" to="/" disabled={props.loading}>Annulla</Link>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default LoginPage;