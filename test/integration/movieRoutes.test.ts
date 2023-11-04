import { expect } from 'chai';
import 'mocha';
import request from 'supertest';
import app from '../../src/app'; 
import { closeConnections } from '../../src/app';
import Movie from '../../src/models/movie.model';
describe('Movies API', () => {
  beforeEach(async () => {
    await Movie.deleteMany({});
  })
  it('should return list of movies', async () => {
    const response = await request(app)
      .get('/movies');
      expect(response.status).to.be.eq(200);
      expect(response.body).to.be.an('array');
  });
  it('should create a movie', async () => {
    const response = await request(app)
    .post('/movies')
    .set('role', 'admin')
    .send({
      title: 'actionmovie',
      genere: 'action',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    expect(response.status).to.be.eq(201);
    expect(response.body.title).to.be.eq('actionmovie')
  })
  it('should update a movie', async () => {
    let movie = new Movie({
      title: 'actionmovie',
      genere: 'action',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    await movie.save();
    const response = await request(app)
    .put(`/movies/${movie._id}`)
    .set('role', 'admin')
    .send({
      title: 'comedymovie',
      genere: 'comedy',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    expect(response.status).to.be.eq(200);
    expect(response.body.title).to.be.eq('comedymovie');
    expect(response.body.genere).to.be.eq('comedy');
    
  })
  it('should delete a movie', async () => {
    let movie = new Movie({
      title: 'actionmovie',
      genere: 'action',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    await movie.save();
    const response = await request(app)
    .delete(`/movies/${movie._id}`)
    .send()
    .set('role', 'admin');
    expect(response.status).to.be.eq(204);
  })
  it('should search for movies', async () => {
    let movie = new Movie({
      title: 'actionmovie',
      genere: 'action',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    await movie.save();
    movie = new Movie({
      title: 'comedy',
      genere: 'comedy',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    await movie.save();
    const response = await request(app)
    .get(`/search?q=comedy`)
    .send()
    expect(response.status).to.be.eq(200);
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.be.eq(1);
  })
  it('should throw 400 while create a movie', async () => {
    const response = await request(app)
    .post('/movies')
    .set('role', 'admin')
    .send({
      title: 'actionmovie',
      genere: 'action',
      rating: "4.5",
      streamingLink: "http://movies.io/moveid"
    });
    expect(response.status).to.be.eq(400);
  })
  it('should throw 400 while updating a movie', async () => {
    let movie = new Movie({
      title: 'actionmovie',
      genere: 'action',
      rating: "4.5",
      streamingLink: "http://movies.io/moveid"
    });
    await movie.save();
    const response = await request(app)
    .put(`/movies/${movie._id}`)
    .set('role', 'admin')
    .send({
      title: 'comedymovie',
      genere: 'comedy',
      streamingLink: "http://movies.io/moveid"
    });
    expect(response.status).to.be.eq(400);
  })

  it('delete a movie - throw 500', async () => {
    const response = await request(app)
    .delete(`/movies/3`)
    .send()
    .set('role', 'admin');
    expect(response.status).to.be.eq(500);
  })

  it('update a movie - throw 500', async () => {
    const response = await request(app)
    .put(`/movies/2`)
    .set('role', 'admin')
    .send({
      title: 'comedymovie',
      genere: 'comedy',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    expect(response.status).to.be.eq(500);
  })

  it('delete a movie - throw 404', async () => {
    const response = await request(app)
    .delete(`/movies/65461ca45e467b5708ca9475`)
    .send()
    .set('role', 'admin');
    expect(response.status).to.be.eq(404);
  })

  it('update a movie - throw 404', async () => {
    const response = await request(app)
    .put(`/movies/65461ca45e467b5708ca9475`)
    .set('role', 'admin')
    .send({
      title: 'comedymovie',
      genere: 'comedy',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    expect(response.status).to.be.eq(404);
  })
  it('create a movie without admin role', async () => {
    const response = await request(app)
    .post('/movies')
    .send({
      title: 'actionmovie',
      genere: 'action',
      rating: 4.5,
      streamingLink: "http://movies.io/moveid"
    });
    expect(response.status).to.be.eq(403);
  })
  it('search for movies - search qurey not recieved', async () => {
    const response = await request(app)
    .get(`/search`)
    .send()
    expect(response.status).to.be.eq(400);
  })
  after((done) => {
    closeConnections();   
    done();
  });
});
