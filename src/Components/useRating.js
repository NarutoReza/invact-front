import axios from "axios"
import { useEffect, useState } from "react"


const useRating = (item) => {
    const [ data, setData ] = useState([])

    useEffect(() => {
        axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/movieRating`, { movieId: item._id })
            .then(res => setData(res.data))
            .catch(err => console.log(err))
    }, [])

    var [ rate, setRate ] = useState(0)
    var [ count, setCount ] = useState(0)

    useEffect(() => {
        if(data !=[] || data !== '' || data !== null || data !== undefined){
            data.map((el, i) => {
                setRate(rate + el.rating)
                setCount(count+ 1)
            })
        }
    }, [data])

    return parseFloat(rate/count).toFixed(1)
}

export default useRating