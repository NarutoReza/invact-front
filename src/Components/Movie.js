import React, { useEffect, useState } from 'react'
import './Movie.css'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { Col, Container, Row } from 'react-bootstrap'
import Popup from 'reactjs-popup'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

function Movie() {
    const navigate = useNavigate()
    const params = useParams()

    const [ username, setUsername ] = useState('')
    const [ token, setToken ] = useState('')

    useEffect(() => {
        if(cookies.get('username')) setUsername(cookies.get('username'))
        else setUsername('')
    }, [1000])

    useEffect(() => {
        if(cookies.get('token')) setToken(cookies.get('token'))
        else setToken('')
    }, [1000])

    const [ disabled, setDisabled ] = useState(true)
    const [ reviewPlace, setReviewPlace ] = useState('Please log in to add review')

    useEffect(() => {
        if(username !== ''){
            if(token !== ''){
                setDisabled(false)
                setReviewPlace('Add you review')
            }
            else{
                setDisabled(true)
                setReviewPlace('Please log in to add review')
            }
        }
        else{
            setDisabled(true)
            setReviewPlace('Please log in to add review')
        }
    })

    const [ movie, setMovie ] = useState([])
    // console.log(movie);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/movie/${params.postId}`)
            .then(res => setMovie(res.data))
            .catch(err => console.log(err))
    }, [])

    const releaseDate = (releaseDate) => {
        const date = new Date(releaseDate)
        const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }

    const [ rating, setRating ] = useState([])
    // console.log(rating);

    useEffect(() => {
        if(movie != [] || movie !== '' || movie !== null || movie !== undefined){
            axios
                .post(`${process.env.REACT_APP_BACKEND_URL}/movieRating`, { movieId: movie._id })
                .then(res => setRating(res.data))
                .catch(err => console.log(err))
        }
        else setRating([])
    }, [ movie ])

    const [ rate, setRate ] = useState(0)
    const [ times, setTimes ] = useState(0)

    useEffect(() => {
        if(rating != [] || rating !== '' || rating !== null || rating !== undefined){
            let r = 0
            let times = 0
            rating && rating.map((el, i) => {
                r = r + parseInt(el.rating)
                times++
            })
            setRate(parseFloat(r/times))
            setTimes(parseInt(times))
        }
        else{
            setRate(0)
            setTimes(0)
        }
    }, [ rating ])

    const timesCount = () => {
        if(times == 1) return 'rating'
        else return 'ratings'
    }

    const [ review, setReview ] = useState('')
    console.log(review);

    const postReview = () => {
        axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/user`, { username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
            .then(res => {
                if(res.data._id == [] || res.data._id == '' || res.data._id == null || res.data._id == undefined) alert('Please log in')
                else{
                    axios
                    .post(`${process.env.REACT_APP_BACKEND_URL}/userRating`, { userId: res.data._id, movieId: movie._id }, { headers: { 'Authorization': `Bearer ${token}`} })
                    .then(response => {
                        if(response.data == [] || response.data == '' || response.data == null || response.data == undefined){
                            axios
                                .post(`${process.env.REACT_APP_BACKEND_URL}/addRating`, { userId: res.data._id, movieId: movie._id, username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
                                .then(respond => {
                                    axios
                                        .patch(`${process.env.REACT_APP_BACKEND_URL}/updateRating/${respond.data._id}`, { userId: res.data._id, movieId: movie._id, review: review }, { headers: { 'Authorization': `Bearer ${token}`} })
                                        .then(resp => {
                                            console.log('by new')
                                            window.location.reload()
                                        })
                                        .catch(console.log)
                                })
                                .catch(console.log)
                        }
                        else{
                            axios
                                .patch(`${process.env.REACT_APP_BACKEND_URL}/updateRating/${response.data._id}`, { userId: res.data._id, movieId: movie._id, review: review }, { headers: { 'Authorization': `Bearer ${token}`} })
                                .then(resp => {
                                    console.log('by old')
                                    window.location.reload()
                                })
                                .catch(console.log)
                        }
                    })
                    .catch(console.log)
                }
            })
            .catch(console.log)
    }
  return (
    <>
        <Container fluid>
            <Row>
                <Col sm='12' className='title'>
                    <h4>{movie.title}</h4>
                </Col>
            </Row>

            <Row className='content-img'>
                <Col sm='4' className='poster'>
                    <img src={`${process.env.REACT_APP_BACKEND_URL}/images/${movie.photo}`} />
                </Col>

                <Col sm='8' className='trailer'>
                    <iframe width="100%" height="100%" src={movie.trailer} title="SPIDER-MAN: NO WAY HOME - Official Trailer (HD)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </Col>
            </Row>

            <Row>
                <Col sm='8' className='description'>
                    <h5>Synopsis</h5>
                    <p>{movie.description}</p>
                </Col>

                <Col sm='4' className='rate'>
                    <a className='rate-no'>
                        <a>{rate} <i class="fa-solid fa-star"></i></a>
                        <br />
                        <a>({times} {timesCount()})</a>
                    </a>

                    <Popup trigger={<button className='rate-btn'>Rate</button>}></Popup>
                </Col>
            </Row>

            <Row>
                <Col sm='6' className='release-date'>
                    <h5>Release Date</h5>
                    <a>{releaseDate(movie.release_year)}</a>
                </Col>
                
                <Col sm='6' className='release-date'>
                    <h5>Genres</h5>
                    <div className='genre'>
                        {
                            movie.genre && movie.genre.map((item, index) => {
                                return(
                                    <a key={index}>{item}</a>
                                )
                            })
                        }
                    </div>
                </Col>
            </Row>

            <Row>
                <Col sm='12' className='reviews'>
                    <h4>Reviews</h4>
                </Col>

                <Col sm='12' className='reviews'>
                    <input type='text' className='review-input' placeholder={reviewPlace} disabled={disabled} onChange={e => setReview(e.target.value)} />

                    <button className='review-btn' onClick={e => { e.preventDefault(); postReview() }}>Post</button>
                </Col>
                
                <Col sm='12' className='reviews'>
                    {
                        rating && rating.map((prod, count) => {
                            return(
                                <div className='review-box' key={count}>
                                    <a>@{prod.username}</a>
                                    <p>{prod.review}</p>
                                </div>
                            )
                        })
                    }
                </Col>
            </Row>
        </Container>
    </>
  )
}

export default Movie