<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db.js';

	let newItem = $state('');

	let todoListNotDeleted = liveQuery(() =>
			db.todos.where({ 'deleted': 'false' }).toArray()
		// async () => {return await db.todos.where("deleted").equals('false').toArray()}
	);

	function handleKeydown(e) {
		if (newItem && e.key === 'Enter') {
			addToList();
		}
	}

	async function addToList() {
		// try {
		const id = db.todos.add({
			text: newItem,
			done: 'false',
			deleted: 'false'
		});
		console.log(`added ${newItem} with id ${id}`);

		newItem = '';

	}

	function deleteCompleted() {
		if (window.confirm('Do you really want to delete all completed TODOs?')) {
			db.todos.where({ 'deleted': false }).filter(t => t.done).modify({ deleted: true });
		}
	}

	function deleteTodo(index) {
		db.todos.filter(t => t.id === index).modify({ deleted: 'true' });
	}

	function updateDone(ev, index) {
		db.todos.update(index, { done: ev.target.checked.toString() });
		console.log(`update ${index} to ${ev.target.checked}`);
	}

	function editTodo(index) {
		// todoList.splice(index, 1);
	}

	let uncompletedCount = liveQuery(
		() => db.todos.where({ 'deleted': 'false', 'done': 'false' }).count()
	);
	let status = $derived(`${$uncompletedCount} out of ${$todoListNotDeleted} TODO(s) unfinished`);

	onMount(() => {
		if (!window.indexedDB) {
			alert('Unsupported Browser: Indexed DB is not supported!');
		}
	});

	function doalert(checkboxElem) {
		if (checkboxElem.checked) {
			alert('hi');
		} else {
			alert('bye');
		}
	}

</script>

<style>
    @import '$lib/styles.css';
</style>

<div class="main">
	<h3>My TODO list</h3>
	<p>{status}</p>
	<input bind:value={newItem} type="text" placeholder="new todo item.." onkeydown={handleKeydown} />
	<button onclick={addToList} disabled={!newItem}>Add</button>
	<button onclick={deleteCompleted}>Remove all TODOs completed</button>
	<br />
	<ul>
		{#if $todoListNotDeleted}
			{#each $todoListNotDeleted as todo, index (todo.id)}
				<li transition:fade={{  duration: 100}}>
					<input onclick={(ev) => updateDone(ev, todo.id)} type="checkbox" />
					<span class:checked={todo.done === "true"}>{todo.text}</span>
					<button onclick={() => deleteTodo(todo.id)}>Remove</button>
					<button onclick={() => editTodo(todo.id)}>Edit</button>
					<br />
				</li>
			{/each}
		{/if}
	</ul>

</div>

