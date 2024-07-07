import React, { useEffect, useState } from 'react'
import './Navebar.css'
import { Col, Container, Nav, Navbar, Row } from 'react-bootstrap'
import { Outlet, useNavigate } from 'react-router'
import Cookies from 'universal-cookie'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import axios from 'axios'

const cookies = new Cookies()

function Navebar() {
    const navigate = useNavigate()

    const [ username, setUsername ] = useState('')
    const [ userType, setUserType ] = useState('user')
    const [ token, setToken ] = useState('')

    useEffect(() => {
        if(cookies.get('username')) setUsername(cookies.get('username'))
        else setUsername('')
    }, [1000])
    
    useEffect(() => {
        if(cookies.get('token')) setToken(cookies.get('token'))
        else setToken('')
    }, [1000])

    const getUser = (username) => {
        axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/user`, { username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
            .then(res => setUserType(res.data.userType))
            .catch(err => console.log(err))
    }

    useEffect(() => {
        if(username !== ''){
            if(token !== '') getUser(username)
            else setUserType('user')
        }
        else setUserType('user')
    }, [ username, token ])

    const [ matches, setMatches ]= useState(window.matchMedia('(max-width: 425px)').matches)

    const popupStyle = () => {
        if(matches == true) return {'width': '100%', 'height': 'fit-content'}
        else if(matches == false) return {'width': '500px', 'height': 'fit-content'}
    }

    useEffect(() => {
        window
            .matchMedia('(max-width: 425px)')
            .addEventListener('change', e => setMatches( e.matches ))
    })

    const [ data, setData ] = useState({
        username: '',
        password: ''
    })

    const updateData = e => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        })
    }

    const [ eyeIcon, setEyeIcon ] = useState('fa-eye')

    const [ passwordText, setPasswordText ] = useState('password')

    useEffect(() => {
        if(passwordText == 'password') setEyeIcon('fa-eye')
        else if(passwordText == 'text') setEyeIcon('fa-eye-slash')
    }, [ passwordText ])

    const submit = e => {
        e.preventDefault();
        axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/login`, { username: data.username, password: data.password })
            .then(res => {
                if(res.data == 'Username not found'){
                    alert(res.data)
                }
                else if(res.data == 'Invalid'){
                    alert('Incorrect password')
                }
                else{
                    alert('Logged In')
                    cookies.set('username', data.username, { path: '/', maxAge: 3600 })
                    cookies.set('token', res.data, { path: '/', maxAge: 3600 })
                }
            })
            .catch(err => console.log(err))
    }

    const [ movieData, setMovieData ] = useState('')
    const [ photo, setPhoto ] = useState('')
    const [ genre, setGenre ] = useState([])
    const [ tag, setTag ] = useState('')

    const handleTag = e => {
        if(tag !== ''){
            setGenre([...genre, tag])
            setTag('')
        }
    }

    const removeGenre = index => {
        setGenre(genre.filter((el, i) => i !== index))
    }

    const updateMovieData = e => {
        setMovieData({
            ...movieData,
            [e.target.name]: e.target.value
        })
    }

    const addMovie = () => {
        return(
            <Popup trigger={<Nav.Item>
                <Nav.Link onClick={() => navigate('/')}>Add Movie</Nav.Link>
            </Nav.Item>} modal nested contentStyle={popupStyle()}>
                {
                    close => (
                        <>
                            <Container>
                                <Row>
                                    <Col sm='12' className='close-btn'>
                                        <a onClick={() => {close(); setGenre([])}}><i class="fa-solid fa-xmark"></i></a>
                                    </Col>
                                    <Col sm='12' className='form-box'>
                                        <form onSubmit={
                                            e => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                if(e.key === 'Enter'){
                                                    e.preventDefault()
                                                }
                                                else{
                                                    axios
                                                        .post(`${process.env.REACT_APP_BACKEND_URL}/upload`, { photo: photo}, { headers: { 'Content-Type': 'multipart/form-data' }} )
                                                        .then(res => {
                                                            axios
                                                                .post(`${process.env.REACT_APP_BACKEND_URL}/addMovie`, { photo: res.data, title: movieData.title, description: movieData.description, release_year: movieData.release_year, genre: genre, username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
                                                                .then(res => {
                                                                    alert('Movie Added')
                                                                    window.location.reload()
                                                                })
                                                                .catch(err => console.log(err))
                                                            close()
                                                            setGenre([])
                                                        })
                                                        .catch(err => console.log(err))
                                                }
                                            }
                                        }>
                                            <div className='form-group'>
                                                <input type='text' className='form-control my-3' autoFocus required name='title' placeholder='Enter movie title' onChange={updateMovieData} />
                                            </div>

                                            <div className='form-group'>
                                                <label for='photo'>Select Movie Poster</label>
                                                <input type='file' className='form-control my-3' autoFocus required name='photo' title='Select movie poster' accept='.png, .jpg, .jpeg' onChange={e => setPhoto(e.target.files[0])} />
                                            </div>

                                            <div className='form-group'>
                                                <div className='tag-container'>
                                                    { genre && genre.map((item, index) => {
                                                        return(
                                                            <div className='tag-item' key={index}>
                                                                <a>{item}</a>
                                                                <a onClick={() => removeGenre(index)}><i class="fa-regular fa-circle-xmark close-mark"></i></a>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                <input type='text' className='form-control my-3' autoFocus required name='genre' placeholder='Enter movie genres' defaultValue={tag} onChange={e => setTag(e.target.value)} />

                                                <a className='right-icon' onClick={() => handleTag()}><i class="fa-solid fa-plus"> Add Genre</i></a>
                                            </div>

                                            <div className='form-group'>
                                                <input type='text' className='form-control my-3' autoFocus required name='description' placeholder='Enter movie description' onChange={updateMovieData} />
                                            </div>

                                            <div className='form-group'>
                                                <input type='date' className='form-control my-3' autoFocus required name='release_year' placeholder='Enter movie release date' onChange={updateMovieData} />
                                            </div>

                                            <div className='form-group btn-group'>
                                                <button className='btn btn-outline-primary btn-movie'>Add Movie</button>
                                            </div>
                                        </form>
                                    </Col>
                                </Row>
                            </Container>
                        </>
                    )
                }
            </Popup>
        )
    }

    const logInButton = () => {
        return(
            <>
                <Popup trigger={<Nav.Item><Nav.Link>Log In</Nav.Link></Nav.Item>} modal nested contentStyle={popupStyle()}>
                    {
                        close => (
                            <>
                                <Container>
                                    <Row>
                                        <Col sm='12' className='close-btn'>
                                            <a onClick={close}><i class="fa-solid fa-xmark"></i></a>
                                        </Col>
                                        <Col sm='12' className='form-box'>
                                            <form onSubmit={
                                                e => {
                                                    e.preventDefault();
                                                    axios
                                                        .post(`${process.env.REACT_APP_BACKEND_URL}/login`, { username: data.username, password: data.password })
                                                        .then(res => {
                                                            if(res.data == 'Username not found'){
                                                                alert(res.data)
                                                            }
                                                            else if(res.data == 'Invalid'){
                                                                alert('Incorrect password')
                                                            }
                                                            else{
                                                                alert('Logged In')
                                                                cookies.set('username', data.username, { path: '/', maxAge: 3600 })
                                                                cookies.set('token', res.data, { path: '/', maxAge: 3600 })
                                                                close()
                                                                window.location.reload()
                                                            }
                                                        })
                                                        .catch(err => console.log(err))
                                                }
                                            }>
                                                <div className='form-group'>
                                                    <label for='username'>Username</label>

                                                    <input type='text' className='form-control my-3' autoFocus required name='username' placeholder='Enter your username' onChange={updateData} />
                                                </div>

                                                <div className='form-group'>
                                                    <label for='password'>Password</label>

                                                    <input type={passwordText} className='form-control my-3' autoFocus required name='password' placeholder='Enter your password' onChange={updateData} />

                                                    <a onClick={() => {
                                                        passwordText == 'password' ? setPasswordText('text') : setPasswordText('password')
                                                    }}><i class={`fa-solid ${eyeIcon} passIcon`}></i></a>
                                                </div>

                                                <div className='form-group btn-group'>
                                                    <button className='btn btn-outline-primary'>Log In</button>
                                                </div>
                                            </form>
                                        </Col>
                                    </Row>
                                </Container>
                            </>
                        )
                    }
                </Popup>
            </>
        )
    }

    const logOutButton = () => {
        cookies.remove('username');
        cookies.remove('token');
        window.location.reload();
    }

    const logOutNav = () => {
        if(userType == 'user') return <Nav.Item>
                <Nav.Link onClick={() => logOutButton()}>Log Out</Nav.Link>
            </Nav.Item>
        else if(userType == 'admin') return <React.Fragment>
                {addMovie()}

                <Nav.Item>
                    <Nav.Link onClick={() => logOutButton()}>Log Out</Nav.Link>
                </Nav.Item>
            </React.Fragment>
    }

    const logButton = () => {
        if(username !== ''){
            if(token !== '') return logOutNav()
            else return logInButton()
        }
        else return logInButton()
    }
  return (
    <>
        <Navbar className='bg-body-tertiary' bg='light' data-bs-theme='light'>
            <Container fluid className='navbar-container'>
                <Container>
                    <Navbar.Brand onClick={() => navigate('/')}>WatchList App</Navbar.Brand>

                    <Nav className='me-auto'>
                        <Nav.Item>
                            <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link>
                        </Nav.Item>

                        <Nav.Item>
                            <Nav.Link onClick={() => navigate('/movies')}>Movie List</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Nav className='ml-auto'>
                        {logButton()}
                    </Nav>
                </Container>
            </Container>
        </Navbar>

        <Outlet />
    </>
  )
}

export default Navebar