defmodule DrawWeb.DrawingChannel do
  use Phoenix.Channel
  alias DrawWeb.Presence

  def join("drawing:" <> _drawing, payload, %{assigns: %{user_id: verified_user_id}} = socket) do
    send(self(), :after_join)
    interval = fps_to_interval(payload["fps"])
    :timer.send_interval(interval, :tick)
    {:ok, %{user_id: verified_user_id}, socket}
  end

  def join("drawing:" <> _drawing, _payload, socket) do
    {:ok, %{error: "Token verification failed"}, socket}
  end

  def handle_info(:after_join, socket) do
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:seconds))
    })
    {:noreply, socket}
  end

  def handle_info(:tick, %{assigns: %{game_state: game_state}} = socket) do
    latest_game_state = Presence.list(socket)
    case game_state == latest_game_state do
      true -> # no change
        {:noreply, socket}
      false ->
        push socket, "drawing:update", latest_game_state
        {:noreply, assign(socket, :game_state, latest_game_state)}
    end
  end

  def handle_info(:tick, socket) do
    latest_game_state = Presence.list(socket)
    # IO.puts "Game State = #{inspect latest_game_state}"
    {:noreply, assign(socket, :game_state, latest_game_state)}
  end

  def handle_in("drawing:update", payload, socket) do
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, fn
      meta = %{paths: paths} ->
        # IO.puts "Meta found here: #{inspect meta} and #{inspect paths}"
        %{meta|
         paths: [payload] ++ paths
      }
      metas ->
        # IO.puts "Metas found here: #{inspect metas}"
        Map.put_new(metas, :paths, [payload])
    end)
    {:noreply, socket}
  end

  # 60000 = ONE_MINUTE
  # 60000 / 60 = 1000 = ONE_SECOND
  # 60 fps = 1000/60 = 16.6666666667
  defp fps_to_interval(fps) do
    round(1000 / fps)
  end
end
