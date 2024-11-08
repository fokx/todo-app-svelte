<script>
	import { dbDexie } from '$lib/db-dexie.js';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';

	let {
		todoList = $bindable(),
		user,
		isDeletedListPage = false
	} = $props();
	let todoListSorted = $derived(todoList ? todoList.toSorted((b, a) => new Date(a.created_at) - new Date(b.created_at)) : []);
	let checked = false;
	let new_text;

	async function deleteTodo(e, index, done) {
		// if (user) {
		// e.target.form.requestSubmit();
		// } else {
		if (done || (!done && window.confirm('This hasn\'t been done yet.\nDo you really want to delete this?'))) {
			dbDexie.todos.filter(t => t.id === index).modify({ deleted: true, synced: false });
		}
		// }
	}


	function updateDone(ev, index) {
		let done = ev.target.checked;
		dbDexie.todos.update(index, { done: done, synced: false });
	}

	async function editTodo(e, index) {
		// if (user) {
		// e.target.form.requestSubmit();
		// } else {
		// todoList.splice(index, 1);
		await dbDexie.todos.get({ id: index }).then(function(result) {
			new_text = prompt(`Change "${result.text}" to:`, result.text);
			if (new_text !== null && new_text !== '') {
				dbDexie.todos.update(index, { text: new_text, synced: false });
			}
		});
		// }
	}

	export function handleCheckboxChange(e, id) {
		updateDone(e, id);
		if (user) {
			e.target.form.requestSubmit();
		}
	}
</script>

<ul class="todos">
	{#if todoListSorted}
		{#each todoListSorted as todo, index (todo.id)}
			<li transition:fade={{  duration: 100}}>
				{#if !isDeletedListPage}
					<form
						method="POST"
						action="?/toggleTodo"
						use:enhance={() => {
        return async ({ result, update }) => {
					if (result.type === 'success') {
					dbDexie.todos.filter(t => t.id === todo.id).modify({ synced: true });
			}
					// console.log(result);
            // if (result.type === 'success') {
            //     await update();
            // }
        };
    }}>
						<!--						<label>-->
						<input
							type="checkbox"
							name="myCheckbox"
							checked={todo.done}
							onchange={(e) => handleCheckboxChange(e, todo.id)}
						/>
						<!--						</label>-->
						<input type="hidden" name="id" value={todo.id} />
						<input type="hidden" name="prev_done" value={todo.done} />
					</form>
				{/if}

				<span class:checked={todo.done}>{todo.text}</span>
				<!--<input class:checked={todo.done} type="text" name="tmp" value={todo.text}/>-->

				<div class="right-buttons">
					<form method="post" action="?/editTodo" use:enhance={({formData, cancel}) => {
					if (user) {
						// let new_text = prompt(`Change "${todo.text}" to:`, todo.text);
			// if (new_text !== null && new_text !== '') {
				// console.log(formData);
				// console.log(Object.keys(formData));
				formData.set('new_text', new_text);
			// } else{
			// 	cancel();
			// }
			return async ({ result, update }) => {
				if (result.type === 'success') {
					dbDexie.todos.filter(t => t.id === todo.id).modify({ synced: true });
			}
				await update();
			};
					}
		}}>
						<input type="hidden" name="id" value={todo.id} />
						<button aria-label="edit todo" style="background: url(./edit.svg) no-repeat 50% 50%;" class="filter-svg" onclick={(e)=>editTodo(e, todo.id)}></button>
					</form>

					{#if !isDeletedListPage}
						<form method="post" action="?/deleteTodo" use:enhance={({formData, cancel}) => {
					if (user){
						// if (!todo.done && !window.confirm('This hasn\'t been done yet.\nDo you really want to delete this?')) {
						// 	cancel();
						// }else{
						return async ({ result, update }) => {
							if (result.type === 'success') {
								dbDexie.todos.filter(t => t.id === todo.id).modify({ synced: true });
								await update();
							}
						};
					}
		}}>
							<input type="hidden" name="id" value={todo.id} />
							<button aria-label="remove todo" style="background: url(./remove.svg) no-repeat 50% 50%;" class="filter-svg" onclick={(e)=>deleteTodo(e, todo.id, todo.done)}></button>
						</form>
					{/if}

				</div>

				<br />
			</li>
		{/each}
	{:else }
		<p>---Nothing yet---</p>
	{/if}
</ul>
