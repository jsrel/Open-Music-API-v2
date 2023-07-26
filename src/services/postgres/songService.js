const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/invariantError');
const NotFoundError = require('../../exceptions/notFoundError');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan!');
    }
    return result.rows[0].id;
  }

  async getAllSongs(title, performer) {
    if (title && performer) {
      const query = {
        text: "SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE '%' || LOWER($1) || '%' AND LOWER(performer) LIKE '%' || LOWER($2) || '%'",
        values: [`%${title}`, `%${performer}`],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }

    if (title || performer) {
      const query = {
        text: "SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE '%' || LOWER($1) || '%' OR LOWER(performer) LIKE '%' || LOWER($2) || '%'",
        values: [`%${title}`, `%${performer}`],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }

    const query = 'SELECT id, title, performer FROM songs';
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan!');
    }
    return result.rows[0];
  }

  async updateSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "album_id" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu!');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dhapus!');
    }
  }
}

module.exports = SongService;
