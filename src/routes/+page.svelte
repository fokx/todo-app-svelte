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
			db.todos.where({ 'deleted': 'false' }).filter(t => t.done === 'true').modify({ deleted: 'true' });
		}
	}

	async function deleteTodo(index) {
		let should_delete = true;
		await db.todos.get({ id: index }).then(function(result) {
			if (result.done !== 'true' && !window.confirm('This hasn\'t been done yet.\nDo you really want to delete this?')) {
				should_delete = false;
				console.log('should not delete');
			}
		});
		if (should_delete === true) {
			console.log(`delete ${index}`);
			db.todos.filter(t => t.id === index).modify({ deleted: 'true' });
		}
	}

	function updateDone(ev, index) {
		db.todos.update(index, { done: ev.target.checked.toString() });
		console.log(`update ${index} to ${ev.target.checked}`);
	}

	async function editTodo(index) {
		// todoList.splice(index, 1);
		await db.todos.get({ id: index }).then(function(result) {
			let new_text = prompt(`Change "${result.text}" to:`, result.text);
			if (new_text !== null && new_text !== "") {
				db.todos.update(index, { text: new_text });
			}
		});
	}

	let uncompletedCount = liveQuery(
		() => db.todos.where({ 'deleted': 'false', 'done': 'false' }).count()
	);

	let todoListNotDeletedCount = liveQuery(
		() => db.todos.where({ 'deleted': 'false' }).count()
	);

	let todo_s_text = $derived('TODO' + ($todoListNotDeletedCount > 1 ? 's' : ''));
	let status = $derived((
		($todoListNotDeletedCount > 0 ?
			($uncompletedCount > 0 ?
				`${$uncompletedCount} out of ${$todoListNotDeletedCount} ${todo_s_text} unfinished`
				: ($todoListNotDeletedCount === 1 ? 'The only' : 'All') + ` ${$todoListNotDeletedCount} ${todo_s_text} finished`) : '')

	));

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
	<button onclick={deleteCompleted} disabled={!($todoListNotDeletedCount-$uncompletedCount)}>Remove all TODOs
		completed
	</button>
	<br />
	<ul>
		{#if $todoListNotDeleted}
			{#each $todoListNotDeleted as todo, index (todo.id)}
				<li transition:fade={{  duration: 100}}>
					<input checked={todo.done === 'true'} onclick={(ev) => updateDone(ev, todo.id)} type="checkbox" />
					<span class:checked={todo.done === 'true'}>{todo.text}</span>
					<button onclick={() => deleteTodo(todo.id)}>Remove</button>
					<button onclick={() => editTodo(todo.id)}>Edit</button>
					<br />
				</li>
			{/each}
		{/if}
	</ul>

</div>

