import React, { useEffect, useState } from 'react'
import './Home.css'
import { Col, Container, Dropdown, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import { Rating } from 'react-simple-star-rating'
import Popup from 'reactjs-popup'
import axios from 'axios'
import Cookies from 'universal-cookie'
import useRating from './useRating'
import InfiniteScroll from 'react-infinite-scroll-component'

const cookies = new Cookies()

function Home() {
  const navigate = useNavigate()

  const [ username, setUsername ] = useState('')
  const [ userData, setUserData ] = useState([])
  const [ token, setToken ] = useState('')

  useEffect(() => {
    if(cookies.get('username')) setUsername(cookies.get('username'))
    else setUsername('')
  }, [1000])
  
  useEffect(() => {
    if(cookies.get('token')) setToken(cookies.get('token'))
    else setToken('')
  }, [1000])

  const getMovie = (username, token) => {
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/user`, { username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
      .then(res => setUserData(res.data.movies))
      .catch(err => console.log(err))
  }

  useEffect(() => {
    getMovie(username, token)
  }, [ username, token ])

  const updateWatchStatus = (status, array, value, position) => {
    if(array == []){
      console.log('empty');
    }
    else{
      let json = array[position]

      if(position > -1){
        array.splice(position, 1)

        json.watch_status = status

        array.push(json)

        axios
          .patch(`${process.env.REACT_APP_BACKEND_URL}/updateWatchList`, { username: username, movies: array }, { headers: { 'Authorization': `Bearer ${token}`} })
          .then(res => console.log(res.data.modifiedCount))
          .catch(err => console.log(err))
        
         getMovie(username, token)
      }

      else{
        getMovie(username, token)
      }
    }
  }

  const addMovieToWatchList = (userMovie, item) => {
    if(userMovie == [] || userMovie == '' || userMovie == null || userMovie == undefined) alert('error')
    else{
      axios
        .patch(`${process.env.REACT_APP_BACKEND_URL}/updateWatchList`, { username: username, movies: userMovie }, { headers: { 'Authorization': `Bearer ${token}`} })
        .then(res => console.log(res.data.modifiedCount))
        .catch(err => console.log(err))
    }
  }

  const newMovieJson = (userMovie, item, rating) => {
    var array = userMovie
    const json = {
      movieId: item._id,
      watch_status: false,
      ratingId: rating._id
    }
    array.push(json)
    return array
  }

  const addToWatchList = (userMovie, item) => {
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/user`, { username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
      .then(res => {
        axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/userRating`, { userId: res.data._id, movieId: item._id}, { headers: { 'Authorization': `Bearer ${token}`} })
          .then(respond => {
            if(respond.data == [] || respond.data == '' || respond.data == null || respond.data == undefined){
              axios
                .post(`${process.env.REACT_APP_BACKEND_URL}/addRating`, { userId: res.data._id, movieId: item._id, username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
                .then(resp => {
                  axios
                    .patch(`${process.env.REACT_APP_BACKEND_URL}/updateWatchList`, { username: username, movies: newMovieJson(userMovie, item, resp.data) }, { headers: { 'Authorization': `Bearer ${token}`} })
                    .then(rsp => console.log(rsp.data.modifiedCount))
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            }
            
            else{
              axios
                .patch(`${process.env.REACT_APP_BACKEND_URL}/updateWatchList`, { username: username, movies: newMovieJson(userMovie, item, respond.data) }, { headers: { 'Authorization': `Bearer ${token}`} })
                .then(rsp => console.log(rsp.data.modifiedCount))
                .catch(err => console.log(err))
            }
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))

      getMovie(username, token)
      getRecommendedMovies()
  }

  const matchMovie = (userMovie, item) => {
    const selected = userMovie?.filter((ele, num) => ele.movieId == item._id)

    if(selected == [] || selected == '' || selected == null || selected == undefined){
      if(username !== ''){
        if(token !== '') return <button className='toggle-watch' onClick={e => { e.preventDefault(); addToWatchList(userMovie, item) }}>Add to WatchList</button>

        else return <button className='toggle-watch' onClick={e => { e.preventDefault(); alert('Please log in') }}>Add to WatchList</button>
      }

      else return <button className='toggle-watch' onClick={e => { e.preventDefault(); alert('Please log in') }}>Add to WatchList</button>
    }

    else if(selected != [] || selected !== '' || selected !== null || selected !== undefined){
      const findIndex = userMovie?.findIndex((ele, num) => ele.movieId == item._id)

      if(selected[0].watch_status == true) return <button className='toggle-watch watched' onClick={e => { e.preventDefault(); updateWatchStatus(false, userMovie, selected, findIndex) }}>Watched</button>
      else return <button className='toggle-watch unwatched' onClick={e => { e.preventDefault(); updateWatchStatus(true, userMovie, selected, findIndex) }}>Unwatched</button>
    }
  }

  const deleteFromWatchList = (userMovie, item) => {
    const selected = userMovie?.filter((ele, num) => ele.movieId == item._id)

    if(selected == [] || selected == '' || selected == null || selected == undefined) alert('error')

    else if(selected != [] || selected !== '' || selected !== null || selected !== undefined){
      const findIndex = userMovie?.findIndex((ele, num) => ele.movieId == item._id)
      var array = userMovie
      array.splice(findIndex, 1)
      axios
        .patch(`${process.env.REACT_APP_BACKEND_URL}/updateWatchList`, { username: username, movies: array }, { headers: { 'Authorization': `Bearer ${token}`} })
        .then(rsp => console.log(rsp.data.modifiedCount))
        .catch(err => console.log(err))
    }
    getMovie(username, token)
  }

  const deleteMovie = (userMovie, item) => {
    const selected = userMovie?.filter((ele, num) => ele.movieId == item._id)

    if(selected == [] || selected == '' || selected == null || selected == undefined) return ''

    else if(selected != [] || selected !== '' || selected !== null || selected !== undefined) return <button className='remove-watch' onClick={(e) => { e.preventDefault(); deleteFromWatchList(userData, item)}}>Remove from WatchList</button>
  }

  const [ userSaved, setUserSaved ] = useState([])
  console.log(userSaved);

  useEffect(() => {
    userData?.map((item, index) => {
      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/movie/${item.movieId}`)
        .then(res => {
          var array = userSaved
          array.push(res.data)
          setUserSaved(array)
        })
        .catch(console.log)
    })
  }, [userData])

  const [ finalSaved, setFinalSaved ] = useState([])
  console.log(finalSaved);

  useEffect(() => {
    let arr = userSaved
    const ids = arr.map(({ _id }) => _id);
    const filtered = arr.filter(({ _id }, index) => !ids.includes(_id, index + 1));

    setFinalSaved(filtered);
  })

  const secondCol = () => {
    if(username !== ''){
      if(token !== '') return( 
        <React.Fragment>
          <Row>
            <Col sm='12' className='movie-head'>
              <h6>Your WatchList Added Movies</h6>
            </Col>
          </Row>

          <Row>
            {
              finalSaved && finalSaved.map((e, k) => {
                return(
                  <Col xl='6' key={k}>
                    <div className='movie-box'>
                      <img src={`${process.env.REACT_APP_BACKEND_URL}/images/${e.photo}`} alt={e.title} />
                      <div className='movie-box-inner'>
                        <div className='movie-box-texts'>
                          <h4 onClick={() => window.location.href=`${process.env.REACT_APP_FRONTEND_URL}/${e._id}/${e.title}`}>{e.title}</h4>
                          <h6>Released on: {getDate(e.release_year)}</h6>
                          <p>4.0 <i class="fa-solid fa-star"></i></p>
                          <p>{e.description}</p>
                        </div>

                        <div className='movie-box-genres'>
                          {
                            e.genre && e.genre.map((el, i) => {
                              if(i<2) return <a key={i}>{el}</a>
                            })
                          }

                          {matchMovie(userData, e)}
                        </div>

                        <div className='movie-box-remove'>
                          {deleteMovie(userData, e)}
                        </div>

                        {reviewSection(e)}
                      </div>
                    </div>
                  </Col>
                )
              })
            }
          </Row>
        </React.Fragment>
      )
      else return ''
    }
    else return ''
  }

  // console.log(userData);


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

  const [ recommendedMovies, setRecommendedMovies ] = useState([])

  const getRecommendedMovies = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/recommendedMovies`)
      .then(res => setRecommendedMovies(res.data))
      .catch(err => console.log(err))
  }

  useEffect(() => {
    getRecommendedMovies()
  }, [])

  const getDate = (releaseDate) => {
    const date = new Date(releaseDate)
    const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const findReview = (movieId) => {
    if(username !== '' || token !== '' || movieId !== ''){
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/user`, { username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
        .then(respond => {
          axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/userRating`, { userId: respond.data._id, movieId: movieId }, { headers: { 'Authorization': `Bearer ${token}`} })
            .then(res => {
              // console.log(res.data.rating)
              // return res.data.rating
              if(res.data == null || res.data == undefined || res.data == [] || res.data == '') return 0
              else return res.data.rating
            })
            .catch(err => console.log(err))
        })
        .catch(error => console.log(error))
    }
    // console.log(rate);
  }

  const giveReview = (movieId, rate) => {
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/user`, { username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
      .then(respond => {
        axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/userRating`, { userId: respond.data._id, movieId: movieId }, { headers: { 'Authorization': `Bearer ${token}`} })
          .then(res => {
            if(res.data == null || res.data == undefined || res.data == [] || res.data == ''){
              axios
                .post(`${process.env.REACT_APP_BACKEND_URL}/addRating`, { userId: res.data._id, movieId: movieId, username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
                .then(resp => {
                  axios
                    .patch(`${process.env.REACT_APP_BACKEND_URL}/updateRating/${resp.data._id}`, { userId: respond.data._id, movieId: movieId, rating: rate }, { headers: { 'Authorization': `Bearer ${token}`} })
                    .then(response => console.log(response.data))
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            }
            else{
              axios
                .patch(`${process.env.REACT_APP_BACKEND_URL}/updateRating/${res.data._id}`, { userId: respond.data._id, movieId: movieId, rating: rate }, { headers: { 'Authorization': `Bearer ${token}`} })
                .then(response => console.log(response.data))
                .catch(err => console.log(err))
            }
          })
          .catch(err => console.log(err))
      })
      .catch(error => console.log(error))
  }

  const reviewSection = (item) => {
    if(username !== ''){
      if(token !== ''){
        return(
          <div className='review'>
            <Rating onClick={(rate) => giveReview(item._id, rate)} initialValue={findReview(item._id)} />

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
                              axios
                                .post(`${process.env.REACT_APP_BACKEND_URL}/user`, { username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
                                .then(res => {
                                  axios
                                    .post(`${process.env.REACT_APP_BACKEND_URL}/userRating`, { userId: res.data._id, movieId: item._id }, { headers: { 'Authorization': `Bearer ${token}`} })
                                    .then(response => {
                                      if(response.data == null || response.data == undefined || response.data == [] || response.data == ''){
                                        axios
                                          .post(`${process.env.REACT_APP_BACKEND_URL}/addRating`, { userId: res.data._id, movieId: item._id, username: username }, { headers: { 'Authorization': `Bearer ${token}`} })
                                          .then(resp => {
                                            axios
                                              .patch(`${process.env.REACT_APP_BACKEND_URL}/updateRating/${resp.data._id}`, { userId: res.data._id, movieId: item._id, review: review }, { headers: { 'Authorization': `Bearer ${token}`} })
                                              .then(res => console.log(res.data.modifiedCount))
                                              .catch(err => console.log(err))
                                          })
                                      }
                                      else{
                                        axios
                                          .patch(`${process.env.REACT_APP_BACKEND_URL}/updateRating/${response.data._id}`, { userId: res.data._id, movieId: item._id, review: review }, { headers: { 'Authorization': `Bearer ${token}`} })
                                          .then(res => console.log(res.data.modifiedCount))
                                          .catch(err => console.log(err))
                                      }
                                    })
                                    .catch(err => console.log(err))
                                })
                                .catch(err => console.log(err))
                                setReview('')
                                close()
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
        )
      }
      else return ''
    }
    else return ''
  }

  const singleMovieRating = (item) => {
    var array = []
    
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/movieRating`, { movieId: item._id })
      .then(res => { return array = res.data})
      .catch(err => console.log(err))

    return array
  }

  return (
    <>
      <Container fluid>
        <Row>
          <Col sm='12' className='movie-head'>
            <h6>Recommended Movies</h6>
          </Col>
        </Row>

        <Row>
          {
            recommendedMovies && recommendedMovies.map((item, index) => {
              return(
                <Col xl='6' key={index}>
                  <div className='movie-box'>
                    <img src={`${process.env.REACT_APP_BACKEND_URL}/images/${item.photo}`} alt={item.title} />
                    <div className='movie-box-inner'>
                      <div className='movie-box-texts'>
                        <h4 onClick={() => window.location.href=`${process.env.REACT_APP_FRONTEND_URL}/${item._id}/${item.title}`}>{item.title}</h4>
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

                        {matchMovie(userData, item)}
                      </div>

                      <div className='movie-box-remove'>
                        {deleteMovie(userData, item)}
                      </div>

                      {reviewSection(item)}
                    </div>
                  </div>
                </Col>
              )
            })
          }
        </Row>
        
        {secondCol()}
      </Container>
    </>
  )
}

export default Home