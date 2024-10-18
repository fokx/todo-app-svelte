<script>
	import { dbDexie } from '$lib/db-dexie.js';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';

	let {
		todos = $bindable(),
		isDeletedListPage = false
	} = $props();


	async function deleteTodo(index) {
		let should_delete = true;
		await dbDexie.todos.get({ id: index }).then(function(result) {
			if (!result.done && !window.confirm('This hasn\'t been done yet.\nDo you really want to delete this?')) {
				should_delete = false;
			}
		});
		if (should_delete === true) {
			dbDexie.todos.filter(t => t.id === index).modify({ deleted: true });
		}
	}

	function updateDone(ev, index) {
		dbDexie.todos.update(index, { done: ev.target.checked.toString() });
	}

	async function editTodo(index) {
		// todoList.splice(index, 1);
		await dbDexie.todos.get({ id: index }).then(function(result) {
			let new_text = prompt(`Change "${result.text}" to:`, result.text);
			if (new_text !== null && new_text !== '') {
				dbDexie.todos.update(index, { text: new_text });
			}
		});
	}

</script>

<ul class="todos">
	{#if todos}
		{#each todos as todo, index (todo.id)}
			<li transition:fade={{  duration: 100}}>
				{#if !isDeletedListPage}
					<input checked={todo.done} onclick={(ev) => updateDone(ev, todo.id)} type="checkbox" />
				{/if}

				<span class:checked={todo.done}>{todo.text}</span>

				{#if !isDeletedListPage}
					<form method="post" action="?/deleteTodo" use:enhance>
						<input type="hidden" name="id" value={todo.id} />
						<button>Remove</button>
					</form>
				{/if}
				<form method="post" action="?/editTodo" use:enhance={({formData, cancel}) => {
					let new_text = prompt(`Change "${todo.text}" to:`, todo.text);
			if (new_text !== null && new_text !== '') {
				console.log(formData);
				console.log(Object.keys(formData));
				formData.set('new_text', new_text);
			} else{
				cancel();
			}
			return async ({ update }) => {
				await update();
			};
		}}>
					<input type="hidden" name="id" value={todo.id} />
					<button>Edit</button>
				</form>
				<br />
			</li>
		{/each}
	{:else }
		<p>---Nothing yet---</p>
	{/if}
</ul>
