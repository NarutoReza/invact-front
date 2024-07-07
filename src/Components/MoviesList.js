import React, { useEffect, useState } from 'react'
import './MoviesList.css'
import './Home.css'
import { Col, Container, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import InfiniteScroll from 'react-infinite-scroll-component'
import axios from 'axios'
import { Rating } from 'react-simple-star-rating'
import Popup from 'reactjs-popup'

function MoviesList() {
    const navigate = useNavigate()

    const [ movies, setMovies ] = useState([])
    console.log(movies);
    const [ isLoading, setIsLoading ] = useState(false)
    const [ error, setError ] = useState(null)
    const [ skip, setSkip ] = useState(0)

    const link = `${process.env.REACT_APP_BACKEND_URL}/movies/skip=`

    const fetchData = () => {
        setIsLoading(true);
        setError(null);

        axios
            .get(`${link}${skip}`)
            .then(res => {
                setMovies(prevItems => [...prevItems, ...res.data])
                setSkip(prevPage => prevPage + 100)
            })
            .catch(err => setError(err))
            .finally(setIsLoading(false))
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleScroll = () => {
        if(window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading) return
        fetchData()
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isLoading])

    const getDate = (releaseDate) => {
        const date = new Date(releaseDate)
        const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }

    const [ rating, setRating ] = useState(0)
    const [ review, setReview ] = useState('')

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
  return (
    <>
        <InfiniteScroll dataLength={movies.length} next={fetchData} hasMore={true} loader={<p>Loading...</p>} endMessage={<p>No more data to load.</p>}>
            <Container fluid>
                <Row>
                    {
                        movies && movies.map((item, index) => {
                            return(
                                <Col xl='6' key={index}>
                                    <div className='movie-box'>
                                        <img src={`${process.env.REACT_APP_BACKEND_URL}/images/${item.photo}`} alt={item.title} />
                                        <div className='movie-box-inner'>
                                        <div className='movie-box-texts'>
                                            <h4 onClick={() => navigate(`/${item._id}/${item.title}`)}>{item.title}</h4>
                                            <h6>Released on: {getDate(item.release_year)}</h6>
                                            <p>4.0 <i class="fa-solid fa-star"></i></p>
                                            <p>{item.description}</p>
                                        </div>

                                        <div className='movie-box-genres'>
                                            {
                                            item.genre && item.genre.map((el, i) => {
                                                if(i<2) return <a key={i}>{el}</a>
                                            })
                                            }

                                            <button className='toggle-watch'>Add to WatchList</button>
                                        </div>

                                        <div className='review'>
                                            <Rating onClick={(rate) => setRating(rate)} initialValue={rating} />
                                            <Popup trigger={<button className='review-btn'>Add Review</button>} modal nested contentStyle={popupStyle()}>
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
                                                            // axios
                                                            //   .post(`${process.env.REACT_APP_BACKEND_URL}/login`, { username: data.username, password: data.password })
                                                            //   .then(res => console.log(res.data))
                                                            //   .catch(err => console.log(err))
                                                            }
                                                        }>
                                                            <div className='form-group'>
                                                            <label for='review'>Enter your review</label>

                                                            <input type='text' className='form-control my-3' autoFocus required name='review' placeholder='Enter your review' defaultValue={review} onChange={e => setReview(e.target.value)} />
                                                            </div>

                                                            <div className='form-group btn-group'>
                                                            <button className='btn btn-outline-primary'>Submit</button>
                                                            </div>
                                                        </form>
                                                        </Col>
                                                    </Row>
                                                    </Container>
                                                </>
                                                )
                                            }
                                            </Popup>
                                        </div>
                                        </div>
                                    </div>
                                </Col>
                            )
                        })
                    }
                </Row>
            </Container>
        </InfiniteScroll>
    </>
  )
}

export default MoviesList