import {Router, Request, Response} from 'express';
import Movie from '../models/movie.model';
import checkAdminRole from '../middlewares/admin.middleware';
import redis from '../services/redisClient';
const router = Router();

const validateMovie = (data: any) => {
  if(!(data.title && data.genere && data.streamingLink && data.rating)) {
    throw new Error('Invalid payload')
  }
  if(typeof data.rating != 'number') {
    throw new Error('rating must be in number');
  }
}
router.get('/movies', async(req: Request, res: Response) => {
  try {
    const moviesList = await redis.get('movies-list');
    if(moviesList) {
      return res.status(200).json(JSON.parse(moviesList));  
    }
    const movies = await Movie.find({});
    await redis.set('movies-list', JSON.stringify(movies));
    res.status(200).json(movies);
  } catch(e) {
    res.status(500).json({error: 'Error fetching movies'});
  }
});

router.post('/movies', checkAdminRole, async(req: Request, res: Response) => {
  try {
    try {
      validateMovie(req.body);
    } catch(e: any) {
      return res.status(400).json({error: e.message});
    }
    const movie = await Movie.create(req.body);
    await redis.del('movies-list')
    res.status(201).json(movie);
  } catch(e) {
    res.status(500).json({error: 'Error in creating movie'});
  }
});

router.put('/movies/:id', checkAdminRole, async(req: Request, res: Response) => {
  try {
    try {
      validateMovie(req.body);
    } catch(e: any) {
      return res.status(400).json({error: e.message});
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!movie) {
      res.status(404).json({error: 'Movie is not found'});
    } else {
      await redis.del('movies-list')
      res.status(200).json(movie);
    }
  } catch(e) {
    res.status(500).json({error: 'Error in updating movie'});
  }
});

router.delete('/movies/:id', checkAdminRole, async(req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if(!movie) {
      res.status(404).json({error: 'Movie is not found'});
    } else {
      await Movie.deleteOne({_id: req.params.id});
      await redis.del('movies-list')
      res.status(204).send();
    }
  } catch(e) {
    res.status(500).json({error: 'Error in deleting movie'});
  }
});

router.get('/search', async(req: Request, res: Response) => {
  try {
    const {q} = req.query;
    if(!q) {
      res.status(400).json({'error': "search query is missing"});
    } else {
      const movies = await Movie.find({
        $or: [
          {title: {$regex: q, $options: 'i'}},
          {genere: {$regex: q, $options: 'i'}}
        ]
      });
      res.status(200).json(movies);
    }
  } catch(e) {
    res.status(500).json({error: 'Error fetching movies'});
  }
});
export default router;