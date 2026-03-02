
type CreateRoomResult =
    | {ok: true, code: string}
    | {ok: false, error: string}

type JoinRoomResult =
    | {ok: true}
    | {ok: false, error: string}

type LeaveRoomResult =
    | {ok: true, code: string}
    | {ok: false, error: string}

type StartGameResult =
    | {ok: true}
    | {ok: false, error: string}
