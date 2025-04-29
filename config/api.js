export default {
    models: {
        /*
        Model: { // настройки модели, название должно совпадать со схемой OpenAPI
            table: 'model', // название таблицы, в которой хранятся объекты модели, обязательный параметр
            user_id: true, // авто-добавление ID текущего пользователя в поле user_id при создании записи
            refs: { // связи с другими моделями, не обязательно
                refName: { // название связи
                    model: 'RefModel', // модель связанной сущности
                    belongs: 'ref_model_id', // ManyToOne/OneToOne, поле в своей таблице, содержащее id "родительской" сущности (ref_model.id == model.ref_model_id), для дочерних сущностей
                    hasMany: 'model_id', // OneToMany, поле в таблице связанной сущности, содержащее id этой сущности (model.id == ref_model.model_id), для родительских сущностей
                    pivot: 'model_pivot_ref_model', // ManyToMany, таблица связей между сущностями (model.id == model_pivot_ref_model.model_id AND ref_model.id == model_pivot_ref_model.ref_model_id)
                }
            },
            access: { // права доступа, не обязательно, отсутствие параметра означает полный запрет доступа
                create: true/false, // публичный доступ на создание, при user_id: true требует авторизации
                create: ['admin'], // доступ на создание только для перечисленных ролей
                read: true/false, // публичный доступ на чтение,
            }
        }
        */
        Author: {
            table: 'author',
            refs: {
                books: {
                    model: 'Book',
                    hasMany: 'author_id',
                }
            },
            access: {
                read: true,
            }
        },
        Book: {
            table: 'book',
            user_id: true,
            refs: {
                author: {
                    model: 'Author',
                    belongs: 'author_id',
                },
                chapters: {
                    model: 'Chapter',
                    hasMany: 'book_id'
                },
                comments: {
                    model: 'BookComment',
                    hasMany: 'book_id',
                },
                genres: {
                    model: 'Genre',
                    pivot: 'book_pivot_genre',
                },
                tags: {
                    model: 'BookTag',
                    pivot: 'book_pivot_book_tag',
                },
                translator: {
                    model: 'Translator',
                    belongs: 'user_id',
                },
                views: {
                    model: 'BookView',
                    hasMany: 'book_id',
                },
            },
            access: {
                read: true,
                update: {
                    pivot: 'book_pivot_user',
                },
                grant: {
                    pivot: 'book_pivot_user',
                }
            },
            defaults: {
                maxPageSize: 20,
                pageSize: 10,
            }
        },
        BookComment: {
            table: 'book_comment',
            user_id: true,
            refs: {
                book: {
                    model: 'Book',
                    belongs: 'book_id',
                },
                comments: {
                    model: 'BookComment',
                    hasMany: 'parent_id',
                },
                parent: {
                    model: 'BookComment',
                    belongs: 'parent_id',
                },
                user: {
                    model: 'User',
                    belongs: 'user_id',
                }
            },
            access: {
                create: true,
                read: true,
            }
        },
        BookTag: {
            table: 'book_tag',
            access: {
                create: ['admin'],
                read: true,
                update: ['admin'],
                delete: ['admin'],
            }
        },
        BookView: {
            table: 'book_view',
        },
        Chapter: {
            table: 'chapter',
            user_id: true,
            refs: {
                book: {
                    model: 'Book',
                    belongs: 'book_id'
                },
                user: {
                    model: 'User',
                    belongs: 'user_id'
                }
            },
            access: {
                read: {
                    inherit: 'book',
                    pivot: 'book_pivot_user',
                    pivot_condition: ['book_pivot_user.book_id', 'chapter.book_id'],
                },
                update: {
                    inherit: 'book',
                    pivot: 'book_pivot_user',
                    pivot_condition: ['book_pivot_user.book_id', 'chapter.book_id'],
                }
            },
            defaults: {
                maxPageSize: 50,
                pageSize: 20,
            }
        },
        Genre: {
            table: 'genre',
            access: {
                create: ['admin'],
                read: true,
                update: ['admin'],
                delete: ['admin'],
            },
        },
        Team: {
            table: 'team',
            refs: {
                subscribers: {
                    model: 'TeamSubscriber',
                    pivot: 'team_subscriber',
                },
                teammates: {
                    model: 'TeamTeammate',
                    pivot: 'team_teammate',
                }
            },
            access: {
                read: true
            }
        },
        TeamComment: {
            table: 'team_comment',
            user_id: true,
            refs: {
                comments: {
                    model: 'TeamComment',
                    hasMany: 'parent_id',
                },
                parent: {
                    model: 'TeamComment',
                    belongs: 'parent_id',
                },
                team: {
                    model: 'Team',
                    belongs: 'team_id',
                },
                user: {
                    model: 'User',
                    belongs: 'user_id',
                }
            },
            access: {
                read: true,
                delete: ['admin']
            }
        },
        TeamTeammate: {
            table: 'user',
            access: {
                read: true
            }
        },
        TeamSubscriber: {
            table: 'user',
            access: {
                read: true
            }
        },
        Translator: {
            table: 'user',
            access: {
                read: true
            }
        },
        User: {
            table: 'user',
        },
    },

    modelSlugs: {
        plural: {
            authors: 'Author',
            book_comments: 'BookComment',
            book_tags: 'BookTag',
            books: 'Book',
            chapters: 'Chapter',
            genres: 'Genre',
            team_comments: 'TeamComment',
            teams: 'Team',
            users: 'User',
        },
        single: {
            author: 'Author',
            book_comment: 'BookComment',
            book_tag: 'BookTag',
            book: 'Book',
            chapter: 'Chapter',
            genre: 'Genre',
            team: 'Team',
            team_comment: 'TeamComment',
            user: 'User',
        },
    }
}
